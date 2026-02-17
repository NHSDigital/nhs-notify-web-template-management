import { SQSClient } from '@aws-sdk/client-sqs';
import { loadConfig } from '../infra/config';

const awsConfig = { region: 'eu-west-2' };

export const renderQueueContainer = () => {
  const { renderRequestQueueUrl } = loadConfig();

  const sqsClient = new SQSClient(awsConfig);

  return {
    sqsClient,
    renderRequestQueueUrl,
  };
};
