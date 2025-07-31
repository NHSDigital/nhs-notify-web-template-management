import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { PublishableEventRecord } from './input-schemas';
import { Event, $Event } from './output-schemas';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  EventMetadata,
  EventMetadataVersionInformation,
} from './base-metadata-schemas';

export class EventBuilder {
  constructor(
    private readonly templatesTableName: string,
    private readonly eventSource: string,
    private readonly logger: Logger
  ) {}

  private classifyTemplateSavedEventType(status: string) {
    const statusOverrides: Record<string, EventMetadataVersionInformation> = {
      DELETED: {
        type: 'uk.nhs.notify.template-management.TemplateDeleted.v1',
        dataschema:
          'https://notify.nhs.uk/events/schemas/template-deleted/v1.json',
        dataschemaversion: '1.0.1',
      },
      SUBMITTED: {
        type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
        dataschema:
          'https://notify.nhs.uk/events/schemas/template-completed/v1.json',
        dataschemaversion: '1.0.1',
      },
    };

    return (
      statusOverrides[status] ?? {
        type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
        dataschema:
          'https://notify.nhs.uk/events/schemas/template-drafted/v1.json',
        dataschemaversion: '1.0.1',
      }
    );
  }

  private buildTemplateSavedEventMetadata(
    id: string,
    templateStatus: string,
    subject: string
  ): EventMetadata {
    return {
      id,
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      source: this.eventSource,
      specversion: '1.0',
      plane: 'control',
      subject,
      ...this.classifyTemplateSavedEventType(templateStatus),
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

    return $Event.parse({
      ...this.buildTemplateSavedEventMetadata(
        publishableEventRecord.eventID,
        dynamoRecord.templateStatus,
        dynamoRecord.id
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
