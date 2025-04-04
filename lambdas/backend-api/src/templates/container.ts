import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { defaultConfigReader } from 'nhs-notify-web-template-management-utils';

export function createContainer() {
  const enableLetters =
    defaultConfigReader.tryGetBoolean('ENABLE_LETTERS_BACKEND') ?? false;
  const quarantineBucket =
    defaultConfigReader.tryGetValue('QUARANTINE_BUCKET_NAME') ?? 'unset';
  const templatesTableName = defaultConfigReader.getValue(
    'TEMPLATES_TABLE_NAME'
  );

  const s3Client = new S3Client({ region: 'eu-west-2' });

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    templatesTableName
  );

  const letterUploadRepository = new LetterUploadRepository(
    s3Client,
    quarantineBucket
  );

  const templateClient = new TemplateClient(
    enableLetters,
    templateRepository,
    letterUploadRepository
  );

  return { templateClient, templateRepository };
}
