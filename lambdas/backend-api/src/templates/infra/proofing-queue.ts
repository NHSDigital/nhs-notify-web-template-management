import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

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
    return this.sqsClient.send(
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
  }
}
