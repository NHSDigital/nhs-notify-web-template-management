import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { failure, success } from '@backend-api/utils/result';
import { ErrorCase } from 'nhs-notify-backend-client';
import type { RenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
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
    requestTypeVariant: PersonalisedRenderRequestVariant,
    lockNumber: number,
    systemPersonalisationPackId: string,
    currentVersion: string
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
            currentVersion,
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
