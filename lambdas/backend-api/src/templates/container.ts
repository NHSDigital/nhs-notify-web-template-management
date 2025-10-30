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

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const letterFileRepositoryContainer = () => {
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

const letterUploadRepositoryContainer = () => {
  const { quarantineBucket, internalBucket, downloadBucket } = loadConfig();

  const letterUploadRepository = new LetterUploadRepository(
    quarantineBucket,
    internalBucket,
    downloadBucket
  );

  return {
    letterUploadRepository,
    logger,
  };
};

const templateRepositoryContainer = () => {
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

export const letterFileRepositoryAndTemplateRepositoryContainer = () => ({
  ...templateRepositoryContainer(),
  ...letterFileRepositoryContainer(),
  logger,
});

export const validateLetterTemplateContainer = () => {
  return {
    ...templateRepositoryContainer(),
    ...letterUploadRepositoryContainer(),
  };
};

export const templatesContainer = () => {
  const config = loadConfig();

  const sqsClient = new SQSClient(awsConfig);
  const ssmClient = new SSMClient(awsConfig);

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

  return {
    templateClient,
  };
};

export const routingConfigContainer = () => {
  const config = loadConfig();

  const ssmClient = new SSMClient(awsConfig);

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

export const submitTemplateContainer = () => {
  const {
    templateSubmittedSenderEmailAddress,
    supplierRecipientEmailAddresses,
  } = loadConfig();

  const sesClient = new SESClient({ region: 'eu-west-2' });

  const emailClient = new EmailClient(
    sesClient,
    templateSubmittedSenderEmailAddress,
    supplierRecipientEmailAddresses,
    logger
  );

  return {
    ...templatesContainer(),
    emailClient,
  };
};
