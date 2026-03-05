import { App } from './app/app';
import { loadConfig } from './config';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { SourceRepository } from './infra/source-repository';
import { S3Repository } from 'nhs-notify-web-template-management-utils';
import { S3Client } from '@aws-sdk/client-s3';
import { Carbone } from './infra/carbone';
import { CheckRender } from './infra/check-render';
import { RenderRepository } from './infra/render-repository';
import { TemplateRepository } from './infra/template-repository';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export function createContainer() {
  const {
    DOWNLOAD_BUCKET_NAME,
    INTERNAL_BUCKET_NAME,
    REGION,
    TEMPLATES_TABLE_NAME,
  } = loadConfig();

  const s3Client = new S3Client({ region: REGION });

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: REGION }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const internalS3 = new S3Repository(INTERNAL_BUCKET_NAME, s3Client);
  const downloadS3 = new S3Repository(DOWNLOAD_BUCKET_NAME, s3Client);

  const sourceRepo = new SourceRepository(internalS3, logger);

  const carbone = new Carbone();

  const checkRender = new CheckRender();

  const renderRepo = new RenderRepository(downloadS3);

  const templateRepo = new TemplateRepository(
    ddbDocClient,
    TEMPLATES_TABLE_NAME
  );

  const app = new App(
    sourceRepo,
    carbone,
    checkRender,
    renderRepo,
    templateRepo,
    logger
  );

  return { app, logger };
}
