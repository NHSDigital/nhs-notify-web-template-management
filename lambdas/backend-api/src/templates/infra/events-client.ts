import type { EventBridgeEvent } from 'aws-lambda';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export class EventsClient {
  private client = new EventBridgeClient();

  constructor(
    private source: string,
    private busName: string = 'default'
  ) {}

  async putEvent<TDetailType extends string, TDetail>(
    event: Pick<
      EventBridgeEvent<TDetailType, TDetail>,
      'detail' | 'detail-type'
    >
  ): Promise<void> {
    logger.info('event', event);
    const { FailedEntryCount = 0, Entries = [] } = await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(event.detail),
            DetailType: event['detail-type'],
            EventBusName: this.busName,
            Source: this.source,
          },
        ],
      })
    );

    logger.info('event sent', { FailedEntryCount, Entries });

    if ((FailedEntryCount || 0) > 0) {
      throw new Error('Failed to send event to EventBridge.', {
        cause: Entries,
      });
    }
  }
}
