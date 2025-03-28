import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { LetterUploadRepository } from './infra/letter-upload-repository';

export function createContainer() {
  const enableLetters = process.env.ENABLE_LETTERS_BACKEND === 'true';
  const quarantineBucket = process.env.QUARANTINE_BUCKET_NAME || 'unset';
  const templatesTableName = process.env.TEMPLATES_TABLE_NAME;

  if (!templatesTableName) {
    throw new Error('process.env.QUARANTINE_BUCKET_NAME is undefined');
  }

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
