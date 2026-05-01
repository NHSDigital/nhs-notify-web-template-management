import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

import { TemplateClient } from '@backend-api/app/template-client';
import { loadConfig } from '@backend-api/infra/config';
import { LetterUploadRepository } from '@backend-api/infra/letter-upload-repository';
import { LetterVariantRepository } from '@backend-api/infra/letter-variant-repository';
import { ProofingQueue } from '@backend-api/infra/proofing-queue';
import { RenderQueue } from '@backend-api/infra/render-queue';
import { RoutingConfigRepository } from '@backend-api/infra/routing-config-repository';
import { TemplateRepository } from '@backend-api/infra/template-repository';
import { clientConfigContainer } from './client-config';

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

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    config.templatesTableName
  );

  const letterUploadRepository = new LetterUploadRepository(
    config.quarantineBucket,
    config.internalBucket,
    config.downloadBucket,
    config.environment
  );

  const proofingQueue = new ProofingQueue(
    sqsClient,
    config.requestProofQueueUrl
  );

  const renderQueue = new RenderQueue(sqsClient, config.renderRequestQueueUrl);

  const { clientConfigRepo } = clientConfigContainer(config);

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config.routingConfigTableName,
    config.templatesTableName
  );

  const letterVariantRepository = new LetterVariantRepository(
    ddbDocClient,
    config.letterVariantTableName,
    config.letterVariantCacheTtlMs
  );

  const templateClient = new TemplateClient(
    templateRepository,
    letterUploadRepository,
    proofingQueue,
    renderQueue,
    config.defaultLetterSupplier,
    clientConfigRepo,
    routingConfigRepository,
    letterVariantRepository,
    logger
  );

  return {
    templateClient,
  };
};
