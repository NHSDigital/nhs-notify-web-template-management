import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { failure, success } from '@backend-api/utils/result';
import { ErrorCase } from 'nhs-notify-backend-client';

export class ProofingQueue {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string
  ) {}

  async send(
    templateId: string,
    owner: string,
    personalisationParameters: string[],
    pdfVersionId: string,
    testDataVersionId: string | undefined,
    supplier: string
  ) {
    try {
      const response = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({
            owner,
            pdfVersionId,
            personalisationParameters,
            supplier,
            templateId,
            testDataVersionId,
          }),
        })
      );
      return success(response);
    } catch (error) {
      return failure(
        ErrorCase.IO_FAILURE,
        'Failed to send to proofing queue',
        error
      );
    }
  }
}
