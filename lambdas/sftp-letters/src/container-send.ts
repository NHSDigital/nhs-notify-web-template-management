import { S3Client } from '@aws-sdk/client-s3';
import { UserDataRepository } from './infra/user-data-repository';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SftpSupplierClientRepository } from './infra/sftp-supplier-client-repository';
import { loadConfig } from './config/config-send';
import { App } from './app/send';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { SyntheticBatch } from './domain/synthetic-batch';
import { TemplateLockRepository } from './infra/template-lock-repository';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import ksuid from 'ksuid';
import NodeCache from 'node-cache';

export function createContainer() {
  const {
    credentialsTtlSeconds,
    csi,
    internalBucketName,
    region,
    sendLockTtlMs,
    sftpEnvironment,
    templatesTableName,
  } = loadConfig();

  const s3Client = new S3Client({ region });

  const ssmClient = new SSMClient({ region });

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const userDataRepository = new UserDataRepository(
    s3Client,
    internalBucketName
  );

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getDate = () => new Date();

  const templateRepository = new TemplateLockRepository(
    ddbDocClient,
    templatesTableName,
    getDate,
    sendLockTtlMs
  );

  const cache = new NodeCache({ stdTTL: credentialsTtlSeconds });

  const sftpSupplierClientRepository = new SftpSupplierClientRepository(
    csi,
    ssmClient,
    cache,
    logger
  );

  const batch = new SyntheticBatch(
    () => ksuid.randomSync(new Date()).string,
    getDate
  );

  const app = new App(
    userDataRepository,
    templateRepository,
    sftpEnvironment,
    batch,
    sftpSupplierClientRepository,
    logger
  );

  return {
    app,
    logger,
  };
}
