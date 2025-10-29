import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import NodeCache from 'node-cache';
import { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateClient } from './app/template-client';
import { RoutingConfigClient } from './app/routing-config-client';
import { TemplateRepository } from './infra';
import { loadConfig } from './infra/config';
import { ClientConfigRepository } from './infra/client-config-repository';
import { LetterFileRepository } from './infra/letter-file-repository';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { ProofingQueue } from './infra/proofing-queue';
import { RoutingConfigRepository } from './infra/routing-config-repository';

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
    config.templatesTableName
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

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config.routingConfigTableName
  );

  const routingConfigClient = new RoutingConfigClient(
    routingConfigRepository,
    clientConfigRepository
  );

  return {
    clientConfigRepository,
    emailClient,
    letterUploadRepository,
    routingConfigClient,
    templateClient,
    templateRepository,
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
  const { templatesTableName } = loadConfig();

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    templatesTableName
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

export const submitRoutingConfigContainer = () => {
  const config = loadConfig();

  const clientConfigRepository = new ClientConfigRepository(
    config.clientConfigSsmKeyPrefix,
    ssmClient,
    new NodeCache({ stdTTL: config.clientConfigTtlSeconds })
  );

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config.routingConfigTableName
  );

  const routingConfigClient = new RoutingConfigClient(
    routingConfigRepository,
    clientConfigRepository
  );

  return {
    routingConfigClient,
  };
};
