import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { failure, success } from '@backend-api/utils/result';
import { ErrorCase } from 'nhs-notify-backend-client';
import type { PersonalisedRenderRequestVariant } from 'nhs-notify-web-template-management-types';

export class RenderQueue {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string
  ) {}

  async send(
    templateId: string,
    clientId: string,
    personalisation: Record<string, string>,
    requestTypeVariant: PersonalisedRenderRequestVariant
  ) {
    try {
      const response = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({
            templateId,
            clientId,
            requestTypeVariant,
            personalisation,
          }),
        })
      );
      return success(response);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Failed to send to render queue',
        error
      );
    }
  }
}
