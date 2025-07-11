import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { PublishableEventRecord } from './input-schemas';
import {
  EventType,
  EventBase,
  Event,
  $TemplateSavedDataFields,
} from './output-schemas';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class EventBuilder {
  constructor(
    private readonly templatesTableName: string,
    private readonly eventSource: string,
    private readonly logger: Logger
  ) {}

  private buildEventBase(
    id: string,
    sequence: string | undefined,
    type: EventType
  ): EventBase {
    return {
      id,
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      sequence,
      source: this.eventSource,
      type,
      specversion: '1.0',
    };
  }

  private buildTemplateSavedEvent(
    publishableEventRecord: PublishableEventRecord
  ): Event | undefined {
    if (!publishableEventRecord.dynamodb.NewImage) {
      // if this is a hard delete do not publish an event - we will publish events
      // when the status is set to deleted
      this.logger.debug({
        description: 'No new image found',
        publishableEventRecord,
      });

      return undefined;
    }

    const dynamoRecord = unmarshall(publishableEventRecord.dynamodb.NewImage);

    return {
      ...this.buildEventBase(
        publishableEventRecord.eventID,
        publishableEventRecord.dynamodb.SequenceNumber,
        'uk.nhs.notify.template-management.TemplateSaved.v1'
      ),
      data: $TemplateSavedDataFields.parse(dynamoRecord),
    };
  }

  buildEvent(
    publishableEventRecord: PublishableEventRecord
  ): Event | undefined {
    if (publishableEventRecord.tableName === this.templatesTableName) {
      return this.buildTemplateSavedEvent(publishableEventRecord);
    }

    this.logger.error({
      description: 'Unrecognised event type',
      publishableEventRecord,
    });

    throw new Error('Unrecognised event type');
  }
}
