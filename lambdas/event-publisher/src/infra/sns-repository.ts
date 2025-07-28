import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Event } from '../domain/output-schemas';

export class SNSRepository {
  constructor(
    private readonly client: SNSClient,
    private readonly topicArn: string
  ) {}

  async publish(event: Event) {
    await this.client.send(
      new PublishCommand({
        Message: JSON.stringify(event),
        TopicArn: this.topicArn,
      })
    );
  }
}
