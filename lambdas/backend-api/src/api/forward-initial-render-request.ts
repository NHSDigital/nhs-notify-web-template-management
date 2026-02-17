import { s3putObjectEventValidator } from 'nhs-notify-web-template-management-utils';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

// replace with LetterUploadRepository.parseKey
export const keyToInitialRenderRequest = (
  key: string
): InitialRenderRequest => {
  const segments = key.split('/');

  if (segments.length !== 4) {
    throw new Error(`Expected four path segments in ${key}`);
  }

  const [, clientId, templateId] = segments;

  return {
    requestType: 'initial',
    template: { templateId, clientId },
  };
};

export const createHandler =
  ({
    sqsClient,
    renderRequestQueueUrl,
  }: {
    sqsClient: SQSClient;
    renderRequestQueueUrl: string;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        object: { key },
      },
    } = s3putObjectEventValidator.parse(event);

    const request = keyToInitialRenderRequest(key);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: renderRequestQueueUrl,
        MessageBody: JSON.stringify(request),
        MessageGroupId: request.template.clientId,
      })
    );
  };
