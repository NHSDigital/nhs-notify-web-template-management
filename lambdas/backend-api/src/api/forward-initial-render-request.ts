import { s3putObjectEventValidator } from 'nhs-notify-web-template-management-utils';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import { LetterUploadRepository } from '../infra/letter-upload-repository';

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
      template: { clientId, templateId, currentVersion },
    };

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: renderRequestQueueUrl,
        MessageBody: JSON.stringify(request),
        MessageGroupId: clientId,
      })
    );
  };
