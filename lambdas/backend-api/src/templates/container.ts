import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SESClient } from '@aws-sdk/client-ses';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { LetterFileRepository } from './infra/letter-file-repository';
import { ProofingQueue } from './infra/proofing-queue';
import { SQSClient } from '@aws-sdk/client-sqs';
import { loadConfig } from './infra/config';
import { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { ClientConfigRepository } from './infra/client-config-repository';
import { SSMClient } from '@aws-sdk/client-ssm';
import NodeCache from 'node-cache';

const awsConfig = { region: 'eu-west-2' };
const sqsClient = new SQSClient(awsConfig);
const ssmClient = new SSMClient(awsConfig);
const sesClient = new SESClient({ region: 'eu-west-2' });

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
    config.internalBucket,
    config.downloadBucket
  );

  const proofingQueue = new ProofingQueue(
    sqsClient,
    config.requestProofQueueUrl
  );

  const clientConfigRepository = new ClientConfigRepository(
    config.clientConfigSsmKeyPrefix,
    ssmClient,
    new NodeCache({ stdTTL: config.clientConfigTtlSeconds })
  );

  const templateClient = new TemplateClient(
    templateRepository,
    letterUploadRepository,
    proofingQueue,
    config.defaultLetterSupplier,
    clientConfigRepository,
    logger
  );

  const emailClient = new EmailClient(
    sesClient,
    config.templateSubmittedSenderEmailAddress,
    config.supplierRecipientEmailAddresses,
    logger
  );

  return {
    templateClient,
    templateRepository,
    letterUploadRepository,
    clientConfigRepository,
    emailClient,
  };
}

export const uploadLetterFileRepositoryContainer = () => {
  const { quarantineBucket, internalBucket, downloadBucket } = loadConfig();

  const letterFileRepository = new LetterFileRepository(
    quarantineBucket,
    internalBucket,
    downloadBucket
  );

  return {
    letterFileRepository,
    logger,
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
    logger,
  };
};

export const uploadLetterFileRepositoryAndTemplateRepositoryContainer = () => ({
  ...createTemplateRepositoryContainer(),
  ...uploadLetterFileRepositoryContainer(),
  logger,
});
