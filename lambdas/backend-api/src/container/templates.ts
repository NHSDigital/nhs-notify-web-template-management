import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import NodeCache from 'node-cache';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateRepository } from '../infra';
import { loadConfig } from '../infra/config';
import { ClientConfigRepository } from '../infra/client-config-repository';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { ProofingQueue } from '../infra/proofing-queue';
import { RoutingConfigRepository } from '../infra/routing-config-repository';
import { TemplateClient } from '../app/template-client';

const awsConfig = { region: 'eu-west-2' };

export const templatesContainer = () => {
  const config = loadConfig();

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(awsConfig),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

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

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config.routingConfigTableName
  );

  const templateClient = new TemplateClient(
    templateRepository,
    letterUploadRepository,
    proofingQueue,
    config.defaultLetterSupplier,
    clientConfigRepository,
    routingConfigRepository,
    logger
  );

  return {
    templateClient,
  };
};
