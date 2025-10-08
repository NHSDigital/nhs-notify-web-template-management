import { migrate } from '../migrate';

import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { print } from '../utils/log-utils';
import { UserTransfer } from '../utils/user-transfer';
import { getTemplates } from '../utils/ddb-utils';
import { getAccountId } from '../utils/sts-utils';
import { transferFileToNewBucket, writeFile } from '../utils/s3-utils';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { UserTransferPlan } from '../utils/types';

jest.mock('node:fs');
jest.mock('../utils/log-utils');
jest.mock('../utils/ddb-utils');
jest.mock('../utils/sts-utils');
jest.mock('../utils/s3-utils');
jest.mock('../utils/user-transfer', () => ({
  UserTransfer: { apply: jest.fn() },
}));

const writeFileSyncMock = jest.mocked(writeFileSync);
const readFileSyncMock = jest.mocked(readFileSync);
const printMock = jest.mocked(print);
const getTemplatesMock = jest.mocked(getTemplates);
const getAccountIdMock = jest.mocked(getAccountId);
const transferFileToNewBucketMock = jest.mocked(transferFileToNewBucket);
const writeFileMock = jest.mocked(writeFile);
const UserTransferMock = jest.mocked(UserTransfer);

const asAttr = (s: string): AttributeValue => ({ S: s });

const accountId = '12345678900';
const environment = 'main';
const planName = 'transfer-plan-12345678900-main-app-1759327447322';
const planFile = `/tmp/${planName}.json`;

const makePlan = (status1 = 'migrate', status2 = 'migrate') => ({
  total: 2,
  tableName: 'nhs-notify-main-app-api-templates',
  bucketName: 'nhs-notify-12345678900-eu-westemplate-2-main-app-internal',
  migrate: {
    count: 2,
    plans: [
      {
        templateId: 'template-1',
        status: status1,
        stage: 'initial',
        ddb: { owner: { from: 'user-1', to: 'CLIENT_A' } },
        s3: {
          files: [
            {
              from: 'pdf-template/user-1/template-1/a.pdf',
              to: 'pdf-template/CLIENT_A/template-1/a.pdf',
            },
          ],
        },
      },
      {
        templateId: 'template-2',
        status: status2,
        stage: 'initial',
        ddb: { owner: { from: 'user-2', to: 'CLIENT_B' } },
        s3: {
          files: [
            {
              from: 'pdf-template/user-2/template-2/b.json',
              to: 'pdf-template/CLIENT_B/template-2/b.json',
            },
          ],
        },
      },
    ],
  },
  orphaned: { count: 0, templateIds: [] },
});

describe('migrate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2025-10-01T14:08:38.641Z'));

    getAccountIdMock.mockResolvedValue(accountId);
    readFileSyncMock.mockReturnValue(JSON.stringify(makePlan()));
    getTemplatesMock.mockResolvedValue([
      { id: asAttr('template-1'), owner: asAttr('user-1') },
      { id: asAttr('template-2'), owner: asAttr('user-2') },
    ]);

    (UserTransferMock.apply as jest.Mock)
      .mockResolvedValueOnce({ success: true, stage: 'finished' })
      .mockResolvedValueOnce({ success: true, stage: 'finished' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should throw error when failing to get accountId', async () => {
    const error = new Error('bang');
    getAccountIdMock.mockReset();
    getAccountIdMock.mockImplementationOnce(() => {
      throw error;
    });

    await expect(
      migrate({ file: planFile, environment, dryRun: false })
    ).rejects.toThrow(error);
  });

  test('should throw error when failing to read from file', async () => {
    const error = new Error('bang');
    readFileSyncMock.mockReset();
    readFileSyncMock.mockImplementationOnce(() => {
      throw error;
    });

    await expect(
      migrate({ file: planFile, environment, dryRun: false })
    ).rejects.toThrow(error);
  });

  test('should throw error when failing to get items from DynamoDB', async () => {
    const error = new Error('bang');
    getTemplatesMock.mockReset();
    getTemplatesMock.mockImplementationOnce(() => {
      throw error;
    });

    await expect(
      migrate({ file: planFile, environment, dryRun: false })
    ).rejects.toThrow(error);
  });

  test('should not migrate anything when no items have "migrate" status', async () => {
    const noMigrate = makePlan('success', 'failed');

    readFileSyncMock.mockReturnValueOnce(JSON.stringify(noMigrate));

    getTemplatesMock.mockResolvedValueOnce([]);

    await migrate({ file: planFile, environment, dryRun: true });

    expect(UserTransferMock.apply).not.toHaveBeenCalled();

    const logs = printMock.mock.calls.map(([m]) => m).join('\n');

    expect(logs).toContain('Total migrations: 0');
  });

  describe('dryRun - false', () => {
    test('should throw error when failing to backup DynamoDB data', async () => {
      writeFileMock.mockRejectedValueOnce(new Error('backup-ddb-json-fail'));

      await expect(
        migrate({ file: planFile, environment, dryRun: false })
      ).rejects.toThrow('backup-ddb-json-fail');
    });

    test('should throw error when failing to backup S3 data', async () => {
      writeFileMock.mockResolvedValueOnce({} as PutObjectCommandOutput);

      transferFileToNewBucketMock.mockRejectedValueOnce(
        new Error('backup-copy-fail')
      );

      await expect(
        migrate({ file: planFile, environment, dryRun: false })
      ).rejects.toThrow('backup-copy-fail');
    });
  });

  test('should skip migration item if cannot be found in backed-up data', async () => {
    const altered = makePlan();

    altered.migrate.plans[0].templateId = 'template-3';

    readFileSyncMock.mockReturnValueOnce(JSON.stringify(altered));

    (UserTransferMock.apply as jest.Mock).mockResolvedValue({
      success: true,
      stage: 'finished',
    });

    await migrate({ file: planFile, environment, dryRun: true });

    const logs = printMock.mock.calls.map(([m]) => m).join('\n');

    expect(logs).toContain(
      'Skipping: Unable to find template template-3 in backup data'
    );

    expect(UserTransferMock.apply).toHaveBeenCalledTimes(1);

    expect(UserTransferMock.apply).toHaveBeenCalledWith(
      expect.objectContaining({ templateId: 'template-2' }),
      { id: asAttr('template-2'), owner: asAttr('user-2') },
      expect.objectContaining({ dryRun: true })
    );
  });

  test('should mark output migration item as failed when migration fails', async () => {
    (UserTransferMock.apply as jest.Mock).mockReset();

    (UserTransferMock.apply as jest.Mock)
      .mockResolvedValueOnce({
        success: false,
        stage: 's3:delete',
        reasons: ['boom'],
      })
      .mockResolvedValueOnce({ success: true, stage: 'finished' });

    await migrate({ file: planFile, environment, dryRun: false });

    const [, data] = writeFileSyncMock.mock.calls[0];

    const parsed = JSON.parse(data.toString()) as UserTransferPlan;

    const migration = parsed.migrate.plans.find(
      (item) => item.templateId === 'template-1'
    );

    expect(migration).toMatchObject({ status: 'failed', stage: 's3:delete' });

    expect(String(migration!.reason)).toContain('boom');
  });

  test('should mark output migration item as success when migration passes', async () => {
    (UserTransferMock.apply as jest.Mock).mockReset();
    (UserTransferMock.apply as jest.Mock).mockResolvedValue({
      success: true,
      stage: 'finished',
    });

    const single = makePlan();

    single.migrate.plans = [single.migrate.plans[0]];

    readFileSyncMock.mockReturnValueOnce(JSON.stringify(single));

    getTemplatesMock.mockResolvedValueOnce([
      { id: asAttr('template-1'), owner: asAttr('user-1') },
    ]);

    await migrate({ file: planFile, environment, dryRun: false });

    const [, data] = writeFileSyncMock.mock.calls[0];

    const parsed = JSON.parse(data.toString()) as UserTransferPlan;

    const migration = parsed.migrate.plans.find(
      (item) => item.templateId === 'template-1'
    );

    expect(migration).toMatchObject({ status: 'success', stage: 'finished' });
  });

  test('should write migration result to file', async () => {
    await migrate({ file: planFile, environment, dryRun: false });

    const { dir, name, ext } = path.parse(planFile);

    const localOut = path.join(dir, `${name}-run${ext}`);

    expect(writeFileSyncMock).toHaveBeenCalledWith(
      localOut,
      expect.any(String)
    );

    const lastS3 = writeFileMock.mock.calls.at(-1)!;

    expect(lastS3[0]).toBe(
      `ownership-transfer/${environment}/${name}/${name}-run${ext}`
    );

    expect(lastS3[2]).toBe(
      `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`
    );
  });
});
