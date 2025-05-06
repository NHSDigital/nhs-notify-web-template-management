import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { LetterFileRepository } from './infra/letter-file-repository';
import { ProofingQueue } from './infra/proofing-queue';
import { SQSClient } from '@aws-sdk/client-sqs';
import { loadConfig } from './infra/config';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

const sqsClient = new SQSClient({ region: 'eu-west-2' });

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

export function createContainer() {
  const config = loadConfig();

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    config.templatesTableName,
    config.enableProofing
  );

  const letterUploadRepository = new LetterUploadRepository(
    config.quarantineBucket,
    config.internalBucket
  );

  const proofingQueue = new ProofingQueue(
    sqsClient,
    config.requestProofQueueUrl
  );

  const templateClient = new TemplateClient(
    config.enableLetters,
    templateRepository,
    letterUploadRepository,
    proofingQueue,
    config.defaultLetterSupplier,
    logger
  );

  return {
    templateClient,
    templateRepository,
    letterUploadRepository,
  };
}

export const createLetterFileRepositoryContainer = () => {
  const { quarantineBucket, internalBucket } = loadConfig();

  const letterFileRepository = new LetterFileRepository(
    quarantineBucket,
    internalBucket
  );

  return {
    letterFileRepository,
  };
};

export const createTemplateRepositoryContainer = () => {
  const { templatesTableName, enableProofing } = loadConfig();

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    templatesTableName,
    enableProofing
  );

  return {
    templateRepository,
  };
};

export const createLetterFileRepositoryAndTemplateRepositoryContainer = () => ({
  ...createTemplateRepositoryContainer(),
  ...createLetterFileRepositoryContainer(),
  logger,
});
