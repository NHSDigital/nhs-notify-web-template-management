// user-transfer.spec.ts
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { UserTransfer } from '../../utils/user-transfer';

import { migrateOwnership } from '../../utils/ddb-utils';
import { print } from '../../utils/log-utils';
import {
  transferFileToClient,
  deleteFile,
  getFileHead,
} from '../../utils/s3-utils';
import { UserTransferPlanItem } from '@/src/utils/types';
import { DeleteObjectCommandOutput } from '@aws-sdk/client-s3';

jest.mock('../../utils/ddb-utils');
jest.mock('../../utils/log-utils');
jest.mock('../../utils/s3-utils');

const migrateOwnershipMock = jest.mocked(migrateOwnership);
const printMock = jest.mocked(print);
const transferFileToClientMock = jest.mocked(transferFileToClient);
const deleteFileMock = jest.mocked(deleteFile);
const getFileHeadMock = jest.mocked(getFileHead);

const asAttr = (s: string): AttributeValue => ({ S: s });

describe('UserTransfer.plan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('builds migrate plans for templates with matching users and marks orphaned when no owner match', async () => {
    const users = [
      { username: 'u1', clientId: 'CLIENT_A', userId: 'user-1' },
      { username: 'u2', clientId: 'CLIENT_B', userId: 'user-2' },
    ];

    const ddb = {
      tableName: 'Templates',
      templates: [
        { id: 'template-1', owner: 'user-1' },
        { id: 'template-2', owner: 'user-missing' },
        { id: 'template-3', owner: 'user-2' },
      ],
    };

    const s3 = {
      bucketName: 'bucket',
      files: [
        'pdf-template/user-1/template-1/a.pdf',
        'pdf-template/user-1/template-1/b.json',
        'pdf-template/user-2/template-3/c.pdf',
        'pdf-template/user-2/other-template/x.pdf', // ignored
      ],
    };

    const plan = await UserTransfer.plan(users, ddb, s3);

    expect(plan).toEqual(
      expect.objectContaining({
        total: 3,
        tableName: 'Templates',
        bucketName: 'bucket',
        migrate: expect.objectContaining({
          count: 2,
          plans: expect.arrayContaining([
            expect.objectContaining({
              templateId: 'template-1',
              status: 'migrate',
              stage: 'initial',
              ddb: { owner: { from: 'user-1', to: 'CLIENT_A' } },
              s3: {
                files: [
                  {
                    from: 'pdf-template/user-1/template-1/a.pdf',
                    to: 'pdf-template/CLIENT_A/template-1/a.pdf',
                  },
                  {
                    from: 'pdf-template/user-1/template-1/b.json',
                    to: 'pdf-template/CLIENT_A/template-1/b.json',
                  },
                ],
              },
            }),
            expect.objectContaining({
              templateId: 'template-3',
              ddb: { owner: { from: 'user-2', to: 'CLIENT_B' } },
              s3: {
                files: [
                  {
                    from: 'pdf-template/user-2/template-3/c.pdf',
                    to: 'pdf-template/CLIENT_B/template-3/c.pdf',
                  },
                ],
              },
            }),
          ]),
        }),
        orphaned: { count: 1, templateIds: ['template-2'] },
      })
    );
  });
});

describe('UserTransfer.apply', () => {
  const baseMigration: UserTransferPlanItem = {
    templateId: 'template-1',
    status: 'migrate',
    stage: 'initial' as const,
    ddb: {
      owner: { from: 'user-1', to: 'CLIENT_A' },
    },
    s3: {
      files: [
        {
          from: 'pdf-template/user-1/template-1/a.pdf',
          to: 'pdf-template/CLIENT_A/template-1/a.pdf',
        },
        {
          from: 'pdf-template/user-1/template-1/b.json',
          to: 'pdf-template/CLIENT_A/template-1/b.json',
        },
      ],
    },
  };

  const template: Record<string, AttributeValue> = {
    id: asAttr('template-1'),
    owner: asAttr('user-1'),
  };

  const config = {
    bucketName: 'bucket',
    tableName: 'Templates',
    dryRun: false,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('dryRun: HEADs files, prints intentions, skips writes, returns success', async () => {
    const dryRunConfig = { ...config, dryRun: true };

    const result = await UserTransfer.apply(
      baseMigration,
      template,
      dryRunConfig
    );

    expect(getFileHeadMock).toHaveBeenCalledTimes(2);
    expect(getFileHeadMock).toHaveBeenNthCalledWith(
      1,
      'bucket',
      'pdf-template/user-1/template-1/a.pdf'
    );
    expect(getFileHeadMock).toHaveBeenNthCalledWith(
      2,
      'bucket',
      'pdf-template/user-1/template-1/b.json'
    );

    expect(transferFileToClientMock).not.toHaveBeenCalled();
    expect(migrateOwnershipMock).not.toHaveBeenCalled();
    expect(deleteFileMock).not.toHaveBeenCalled();

    expect(printMock.mock.calls.join('\n')).toContain('[DRY RUN]');
    expect(result).toEqual({ success: true, stage: 'finished' });
  });

  it('should copy migrate data', async () => {
    const result = await UserTransfer.apply(baseMigration, template, config);

    expect(transferFileToClientMock).toHaveBeenCalledTimes(2);
    expect(transferFileToClientMock).toHaveBeenNthCalledWith(
      1,
      'bucket',
      'pdf-template/user-1/template-1/a.pdf',
      'pdf-template/CLIENT_A/template-1/a.pdf',
      'CLIENT_A'
    );
    expect(transferFileToClientMock).toHaveBeenNthCalledWith(
      2,
      'bucket',
      'pdf-template/user-1/template-1/b.json',
      'pdf-template/CLIENT_A/template-1/b.json',
      'CLIENT_A'
    );

    expect(migrateOwnershipMock).toHaveBeenCalledWith(
      'Templates',
      template,
      'user-1',
      'CLIENT_A'
    );

    expect(deleteFileMock).toHaveBeenCalledTimes(2);
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      1,
      'bucket',
      'pdf-template/user-1/template-1/a.pdf'
    );
    expect(deleteFileMock).toHaveBeenNthCalledWith(
      2,
      'bucket',
      'pdf-template/user-1/template-1/b.json'
    );

    expect(result).toEqual({ success: true, stage: 'finished' });
  });

  it('fails at s3:copy stage when any copy rejects', async () => {
    transferFileToClientMock
      .mockRejectedValueOnce(new Error('boom-copy'))
      .mockResolvedValueOnce();

    const result = await UserTransfer.apply(baseMigration, template, config);

    expect(result.success).toBe(false);
    expect(result.stage).toBe('s3:copy');
    expect(printMock.mock.calls.join('\n')).toContain('Skipping: [s3:copy]');
    expect(migrateOwnershipMock).not.toHaveBeenCalled();
    expect(deleteFileMock).not.toHaveBeenCalled();
  });

  it('fails at ddb:transfer when migrateOwnership throws', async () => {
    migrateOwnershipMock.mockRejectedValueOnce(new Error('boom-ddb'));

    const result = await UserTransfer.apply(baseMigration, template, config);

    expect(result.success).toBe(false);
    expect(result.stage).toBe('ddb:transfer');
    expect(printMock.mock.calls.join('\n')).toContain('Failed: [ddb:transfer]');
    expect(deleteFileMock).not.toHaveBeenCalled();
  });

  it('partial failure at s3:delete when any delete rejects', async () => {
    deleteFileMock
      .mockRejectedValueOnce(new Error('boom-delete'))
      .mockResolvedValueOnce({} as unknown as DeleteObjectCommandOutput);

    const result = await UserTransfer.apply(baseMigration, template, config);

    expect(result.success).toBe(false);
    expect(result.stage).toBe('s3:delete');
    expect(printMock.mock.calls.join('\n')).toContain('Partial: [s3:delete]');
  });
});
