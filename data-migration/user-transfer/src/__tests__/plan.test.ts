import { plan } from '../plan';
import { writeFileSync } from 'node:fs';
import { CognitoRepository } from '../utils/cognito-repository';
import { listAllTemplates } from '../utils/ddb-utils';
import { listAllFiles, writeFile as writeRemote } from '../utils/s3-utils';
import { UserTransfer } from '../utils/user-transfer';
import { getAccountId } from '../utils/sts-utils';
import { print } from '../utils/log-utils';
import { UserTransferPlan } from '../utils/types';

jest.mock('node:fs');
jest.mock('../utils/cognito-repository');
jest.mock('../utils/ddb-utils');
jest.mock('../utils/s3-utils');
jest.mock('../utils/sts-utils');
jest.mock('../utils/log-utils');
jest.mock('../utils/user-transfer', () => ({
  UserTransfer: { plan: jest.fn() },
}));
jest.mock('@aws-sdk/client-cognito-identity-provider');

const writeFileSyncMock = jest.mocked(writeFileSync);
const cognitoRepositoryMock = jest.mocked(CognitoRepository);
const listAllTemplatesMock = jest.mocked(listAllTemplates);
const listAllFilesMock = jest.mocked(listAllFiles);
const writeRemoteMock = jest.mocked(writeRemote);
const UserTransferMock = jest.mocked(UserTransfer);
const getAccountIdMock = jest.mocked(getAccountId);
const printMock = jest.mocked(print);

const tableName = 'nhs-notify-main-app-api-templates';
const internalBucket = 'nhs-notify-12345678900-eu-west-2-main-app-internal';
const backupBucket =
  'nhs-notify-12345678900-eu-west-2-main-acct-migration-backup';

describe('plan', () => {
  const NOW = 1_759_327_447_322;
  let nowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    jest.resetAllMocks();
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('builds the plan and writes it to S3 and disk with expected names', async () => {
    const params = {
      environment: 'main',
      userPoolId: 'pool-123',
      iamAccessKeyId: 'AKID',
      iamSecretAccessKey: 'SECRET',
      iamSessionToken: 'TOKEN',
    };
    const files = ['pdf-template/user-1/template-1/a.pdf'];
    const templates = [{ id: 'template-1', owner: 'user-1' }];
    const cognitoRepositoryMockInstance = {
      getAllUsers: jest
        .fn()
        .mockResolvedValue([
          { username: 'u1', clientId: 'CLIENT_A', userId: 'user-1' },
        ]),
    } as unknown as CognitoRepository;

    cognitoRepositoryMock.mockImplementationOnce(
      () => cognitoRepositoryMockInstance
    );
    listAllFilesMock.mockResolvedValue(files);
    listAllTemplatesMock.mockResolvedValue(templates);
    getAccountIdMock.mockResolvedValue('12345678900');

    const transferPlan: UserTransferPlan = {
      total: 1,
      tableName,
      bucketName: internalBucket,
      migrate: {
        count: 1,
        plans: [
          {
            templateId: 'template-1',
            status: 'migrate',
            stage: 'initial',
            ddb: {
              owner: {
                to: 'abc',
                from: 'efg',
              },
            },
            s3: { files: [] },
          },
        ],
      },
      orphaned: { count: 0, templateIds: [] },
    };

    UserTransferMock.plan.mockResolvedValue(transferPlan);

    await plan(params);

    const filename = `transfer-plan-12345678900-main-app-${NOW}`;
    const s3Key = `ownership-transfer/main/${filename}/${filename}.json`;
    const json = JSON.stringify(transferPlan);

    expect(listAllTemplatesMock).toHaveBeenCalledWith(tableName);
    expect(listAllFilesMock).toHaveBeenCalledWith(internalBucket);
    expect(UserTransferMock.plan).toHaveBeenCalledWith(
      [
        {
          username: 'u1',
          clientId: 'CLIENT_A',
          userId: 'user-1',
        },
      ],
      { tableName, templates },
      { bucketName: internalBucket, files }
    );
    expect(writeRemoteMock).toHaveBeenCalledWith(s3Key, json, backupBucket);
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      `./migrations/${filename}.json`,
      json
    );
    expect(printMock).toHaveBeenCalledWith(
      `Results written to ${filename}.json`
    );
  });
});
