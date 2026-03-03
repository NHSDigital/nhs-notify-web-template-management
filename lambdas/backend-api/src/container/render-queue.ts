import { SQSClient } from '@aws-sdk/client-sqs';
import { loadConfig } from '../infra/config';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

const awsConfig = { region: 'eu-west-2' };

export const renderQueueContainer = () => {
  const { renderRequestQueueUrl } = loadConfig();

  const sqsClient = new SQSClient(awsConfig);

  return {
    sqsClient,
    renderRequestQueueUrl,
    logger,
  };
};
