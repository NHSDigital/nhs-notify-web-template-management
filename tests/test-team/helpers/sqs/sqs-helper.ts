import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

export class SqsHelper {
  private readonly client = new SQSClient({ region: 'eu-west-2' });

  async sendMessage(queueUrl: string, message: Record<string, unknown>) {
    return this.client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
  }
}
