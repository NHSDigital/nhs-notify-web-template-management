import { eventBridgeS3ObjectCreatedValidator } from 'nhs-notify-web-template-management-utils';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

export const createHandler =
  ({
    sqsClient,
    renderRequestQueueUrl,
    logger,
  }: {
    sqsClient: SQSClient;
    renderRequestQueueUrl: string;
    logger: Logger;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        object: { key },
      },
    } = eventBridgeS3ObjectCreatedValidator.parse(event);

    const {
      'file-type': fileType,
      'client-id': clientId,
      'template-id': templateId,
      'version-id': currentVersion,
    } = LetterUploadRepository.parseKey(key);

    if (fileType !== 'docx-template') {
      throw new Error(
        `Expected file type "docx-template" but got "${fileType}"`
      );
    }

    const request: InitialRenderRequest = {
      requestType: 'initial',
      clientId,
      templateId,
      currentVersion,
    };

    logger.info('Forwarding initial render request', request);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: renderRequestQueueUrl,
        MessageBody: JSON.stringify(request),
        MessageGroupId: clientId,
      })
    );
  };
