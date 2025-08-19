import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  MAJOR_VERSION,
  VERSION,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { $DynamoDBTemplate, PublishableEventRecord } from './input-schemas';
import { Event, $Event } from './output-schemas';

export class EventBuilder {
  constructor(
    private readonly templatesTableName: string,
    private readonly eventSource: string,
    private readonly logger: Logger
  ) {}

  private classifyTemplateSavedEventType(status: string) {
    switch (status) {
      case 'DELETED': {
        return 'TemplateDeleted';
      }

      case 'SUBMITTED': {
        return 'TemplateCompleted';
      }

      default: {
        return 'TemplateDrafted';
      }
    }
  }

  private buildTemplateSavedEventMetadata(
    id: string,
    templateStatus: string,
    subject: string
  ) {
    const type = this.classifyTemplateSavedEventType(templateStatus);

    return {
      id,
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      source: this.eventSource,
      specversion: '1.0',
      plane: 'control',
      subject,
      type: `uk.nhs.notify.template-management.${type}.v${MAJOR_VERSION}`,
      dataschema: `https://notify.nhs.uk/events/schemas/${type}/v${MAJOR_VERSION}.json`,
      dataschemaversion: VERSION,
    };
  }

  private buildTemplateDatabaseEvent(
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

    const databaseTemplate = $DynamoDBTemplate.parse(dynamoRecord);

    if (!shouldPublish(databaseTemplate)) {
      this.logger.debug({
        description: 'Not publishing event',
        publishableEventRecord,
      });

      return undefined;
    }

    return $Event.parse({
      ...this.buildTemplateSavedEventMetadata(
        publishableEventRecord.eventID,
        databaseTemplate.templateStatus,
        databaseTemplate.id
      ),
      data: dynamoRecord,
    });
  }

  buildEvent(
    publishableEventRecord: PublishableEventRecord
  ): Event | undefined {
    if (publishableEventRecord.tableName === this.templatesTableName) {
      return this.buildTemplateDatabaseEvent(publishableEventRecord);
    }

    this.logger.error({
      description: 'Unrecognised event type',
      publishableEventRecord,
    });

    throw new Error('Unrecognised event type');
  }
}
