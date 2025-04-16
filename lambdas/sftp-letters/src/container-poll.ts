import { S3Client } from '@aws-sdk/client-s3';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SftpSupplierClientRepository } from './infra/sftp-supplier-client-repository';
import { loadConfig } from './config/config-poll';
import { App } from './app/poll';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  InMemoryCache,
  S3Repository,
} from 'nhs-notify-web-template-management-utils';

export function createContainer() {
  const {
    csi,
    quarantineBucketName,
    credentialsTtlMs,
    region,
    sftpEnvironment,
  } = loadConfig();

  const ssmClient = new SSMClient({ region });

  const s3Client = new S3Client({ region });

  const cache = new InMemoryCache({ ttl: credentialsTtlMs });

  const sftpSupplierClientRepository = new SftpSupplierClientRepository(
    csi,
    ssmClient,
    cache,
    logger
  );

  const s3Repository = new S3Repository(quarantineBucketName, s3Client);

  const app = new App(
    sftpSupplierClientRepository,
    logger,
    s3Repository,
    sftpEnvironment
  );

  return {
    app,
  };
}

export type Container = ReturnType<typeof createContainer>;
