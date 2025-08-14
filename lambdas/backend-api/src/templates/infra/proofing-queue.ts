import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { failure, success } from '@backend-api/utils/result';
import {
  ErrorCase,
  type Language,
  type LetterType,
} from 'nhs-notify-backend-client';
import type { User } from 'nhs-notify-web-template-management-utils';

export class ProofingQueue {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string
  ) {}

  async send(
    templateId: string,
    templateName: string,
    user: User,
    campaignId: string,
    personalisationParameters: string[],
    letterType: LetterType,
    language: Language,
    pdfVersionId: string,
    testDataVersionId: string | undefined,
    supplier: string,
    clientOwned: boolean
  ) {
    try {
      const response = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({
            campaignId,
            clientOwned,
            language,
            letterType,
            pdfVersionId,
            personalisationParameters,
            supplier,
            templateId,
            templateName,
            testDataVersionId,
            user,
          }),
        })
      );
      return success(response);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Failed to send to proofing queue',
        error
      );
    }
  }
}
