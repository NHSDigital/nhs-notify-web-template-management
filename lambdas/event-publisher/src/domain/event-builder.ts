import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  MAJOR_VERSION,
  VERSION,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  $DynamoDBRoutingConfig,
  $DynamoDBTemplate,
  PublishableEventRecord,
} from './input-schemas';
import { Event, $Event } from './output-schemas';
import { shouldPublish } from './should-publish';

export class EventBuilder {
  constructor(
    private readonly templatesTableName: string,
    private readonly routingConfigTableName: string,
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

  private classifyRoutingConfigSavedEventType(status: string) {
    switch (status) {
      case 'DELETED': {
        return 'RoutingConfigDeleted';
      }

      case 'COMPLETED': {
        return 'RoutingConfigCompleted';
      }

      default: {
        return 'RoutingConfigDrafted';
      }
    }
  }

  private buildEventMetadata(id: string, type: string, subject: string) {
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
    const dynamoRecordNew = unmarshall(
      publishableEventRecord.dynamodb.NewImage
    );
    const dynamoRecordOld = publishableEventRecord.dynamodb.OldImage
      ? unmarshall(publishableEventRecord.dynamodb.OldImage)
      : undefined;

    const databaseTemplateNew = $DynamoDBTemplate.parse(dynamoRecordNew);
    const databaseTemplateOld = $DynamoDBTemplate
      .optional()
      .parse(dynamoRecordOld);

    if (!shouldPublish(databaseTemplateOld, databaseTemplateNew)) {
      this.logger.debug({
        description: 'Not publishing event',
        publishableEventRecord,
      });

      return undefined;
    }

    try {
      return $Event.parse({
        ...this.buildEventMetadata(
          publishableEventRecord.eventID,
          this.classifyTemplateSavedEventType(
            databaseTemplateNew.templateStatus
          ),
          databaseTemplateNew.id
        ),
        data: dynamoRecordNew,
      });
    } catch (error) {
      this.logger
        .child({
          description: 'Failed to parse outgoing event',
          publishableEventRecord,
        })
        .error(error);

      throw error;
    }
  }

  private buildRoutingConfigDatabaseEvent(
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

    const databaseRoutingConfig = $DynamoDBRoutingConfig.parse(dynamoRecord);

    const event = $Event.safeParse({
      ...this.buildEventMetadata(
        publishableEventRecord.eventID,
        this.classifyRoutingConfigSavedEventType(databaseRoutingConfig.status),
        databaseRoutingConfig.id
      ),
      data: dynamoRecord,
    });

    // Do not error if the event is not valid because routing config database entries may be
    // in a state where we do not yet want to publish them (such as having null template values)
    if (!event.success) {
      this.logger.info({
        description: 'Routing config event is not in a valid state',
        publishableEventRecord,
        errors: event.error,
      });

      return undefined;
    }

    return event.data;
  }

  buildEvent(
    publishableEventRecord: PublishableEventRecord
  ): Event | undefined {
    switch (publishableEventRecord.tableName) {
      case this.templatesTableName: {
        return this.buildTemplateDatabaseEvent(publishableEventRecord);
      }
      case this.routingConfigTableName: {
        return this.buildRoutingConfigDatabaseEvent(publishableEventRecord);
      }
      default: {
        this.logger.error({
          description: 'Unrecognised event type',
          publishableEventRecord,
        });

        throw new Error('Unrecognised event type');
      }
    }
  }
}
