import { S3Client } from '@aws-sdk/client-s3';
import { UserDataRepository } from './infra/user-data-repository';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SftpSupplierClientRepository } from './infra/sftp-supplier-client-repository';
import { loadConfig } from './config/config';
import { App } from './app/send';
import { logger } from 'nhs-notify-web-template-management-utils';
import { randomId } from './infra/ksuid-like-id';
import { Batch } from './domain/batch';
import { TemplateRepository } from './infra/template-repository';

export function createContainer() {
  const { csi, internalBucketName, defaultSupplier, sftpEnvironment, region } =
    loadConfig();

  const s3Client = new S3Client({ region });

  const ssmClient = new SSMClient({ region });

  const userDataRepository = new UserDataRepository(
    s3Client,
    internalBucketName
  );

  const templateRepository = new TemplateRepository();

  const sftpSupplierClientRepository = new SftpSupplierClientRepository(
    csi,
    ssmClient
  );

  const batch = new Batch(randomId, () => new Date());

  const app = new App(
    userDataRepository,
    templateRepository,
    sftpEnvironment,
    batch,
    logger
  );

  return {
    app,
    sftpSupplierClientRepository,
    defaultSupplier,
    logger,
  };
}
