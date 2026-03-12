import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { failure, success } from '@backend-api/utils/result';
import { ErrorCase, type RenderRequest } from 'nhs-notify-backend-client/types';
import type { PersonalisedRenderRequestVariant } from 'nhs-notify-web-template-management-types';

export class RenderQueue {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string
  ) {}

  async send(
    templateId: string,
    clientId: string,
    lockNumber: number,
    personalisation: Record<string, string>,
    requestTypeVariant: PersonalisedRenderRequestVariant,
    systemPersonalisationPackId: string,
    docxCurrentVersion: string
  ) {
    try {
      const response = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageGroupId: clientId,
          MessageBody: JSON.stringify({
            templateId,
            clientId,
            requestType: 'personalised',
            personalisation,
            requestTypeVariant,
            lockNumber,
            systemPersonalisationPackId,
            docxCurrentVersion,
          } satisfies Extract<RenderRequest, { requestType: 'personalised' }>),
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
