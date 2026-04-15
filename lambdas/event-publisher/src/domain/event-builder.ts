import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  MAJOR_VERSION,
  VERSION,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  $DynamoDBProofRequest,
  $DynamoDBRoutingConfig,
  $DynamoDBTemplate,
  $DynamoDBTemplateOldImage,
  DynamoDBTemplate,
  PublishableEventRecord,
} from './input-schemas';
import { Event, $Event } from './output-schemas';
import { shouldPublish } from './should-publish';

type EventBuilderOutput =
  | {
      event: Event;
      sharedFiles?: Record<string, string>;
    }
  | undefined;

export class EventBuilder {
  constructor(
    private readonly templatesTableName: string,
    private readonly routingConfigTableName: string,
    private readonly proofRequestsTableName: string,
    private readonly eventSource: string,
    private readonly sharedFileBucket: string,
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

  private buildEventMetadata(
    id: string,
    type: string,
    subject: string,
    plane: 'control' | 'data' = 'control'
  ) {
    return {
      id,
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      source: this.eventSource,
      specversion: '1.0',
      plane,
      subject,
      type: `uk.nhs.notify.template-management.${type}.v${MAJOR_VERSION}`,
      dataschema: `https://notify.nhs.uk/events/schemas/${type}/v${MAJOR_VERSION}.json`,
      dataschemaversion: VERSION,
    };
  }

  private getInternalFilePathForTemplateEvent(
    databaseTemplate: DynamoDBTemplate
  ) {
    const { clientId, id, files } = databaseTemplate;
    if (!files || !files.docxTemplate) {
      this.logger.error({
        description: 'Unexpected missing docx template',
        databaseTemplate,
      });
      throw new Error('Unexpected missing DOCX template');
    }

    return `docx-template/${clientId}/${id}/${files.docxTemplate.currentVersion}.docx`;
  }

  private getSharedFilePathForTemplateEvent({
    clientId,
    id,
  }: DynamoDBTemplate) {
    return `${clientId}/${id}/${Date.now()}.docx`;
  }

  private getNonDatabaseFieldsForTemplateEvent(
    databaseTemplate: DynamoDBTemplate
  ) {
    if (databaseTemplate.templateType !== 'LETTER') {
      return {};
    }

    return {
      files: {
        docxTemplate: {
          url: `${this.sharedFileBucket}/${this.getSharedFilePathForTemplateEvent(databaseTemplate)}`,
        },
      },
      personalisationParameters: databaseTemplate.customPersonalisation,
    };
  }

  private getSharedFileMappingsForTemplateEvent(
    databaseTemplate: DynamoDBTemplate
  ) {
    if (databaseTemplate.templateType !== 'LETTER') {
      return {};
    }

    const internalFilePath =
      this.getInternalFilePathForTemplateEvent(databaseTemplate);
    const sharedFilePath =
      this.getSharedFilePathForTemplateEvent(databaseTemplate);

    return {
      [internalFilePath]: sharedFilePath,
    };
  }

  private buildTemplateDatabaseEvent(
    publishableEventRecord: PublishableEventRecord
  ): EventBuilderOutput {
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

    const safeParsedDynamoRecordNew =
      $DynamoDBTemplate.safeParse(dynamoRecordNew);

    if (!safeParsedDynamoRecordNew.success) {
      const error = safeParsedDynamoRecordNew.error;
      this.logger
        .child({
          description: 'Failed to parse dynamo record',
          publishableEventRecord,
        })
        .error(error);

      throw error;
    }

    const databaseTemplateNew = safeParsedDynamoRecordNew.data;
    const databaseTemplateOld = $DynamoDBTemplateOldImage
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
      return {
        event: $Event.parse({
          ...this.buildEventMetadata(
            publishableEventRecord.eventID,
            this.classifyTemplateSavedEventType(
              databaseTemplateNew.templateStatus
            ),
            databaseTemplateNew.id
          ),
          data: {
            ...dynamoRecordNew,
            ...this.getNonDatabaseFieldsForTemplateEvent(databaseTemplateNew),
          },
        }),
        sharedFiles:
          this.getSharedFileMappingsForTemplateEvent(databaseTemplateNew),
      };
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
  ): EventBuilderOutput {
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

    return { event: event.data };
  }

  private buildProofRequestedEvent(
    publishableEventRecord: PublishableEventRecord
  ): EventBuilderOutput {
    if (!publishableEventRecord.dynamodb.NewImage) {
      // Do not publish an event if a proof-request record is deleted
      this.logger.debug({
        description: 'No new image found',
        publishableEventRecord,
      });

      return undefined;
    }

    const dynamoRecord = unmarshall(publishableEventRecord.dynamodb.NewImage);

    const databaseProofRequest = $DynamoDBProofRequest.parse(dynamoRecord);

    try {
      return {
        event: $Event.parse({
          ...this.buildEventMetadata(
            publishableEventRecord.eventID,
            'ProofRequested',
            databaseProofRequest.id,
            'data'
          ),
          data: dynamoRecord,
        }),
      };
    } catch (error) {
      this.logger
        .child({
          description: 'Failed to parse outgoing event for proof request',
          publishableEventRecord,
        })
        .error(error);

      throw error;
    }
  }

  buildEvent(
    publishableEventRecord: PublishableEventRecord
  ): EventBuilderOutput {
    switch (publishableEventRecord.tableName) {
      case this.templatesTableName: {
        return this.buildTemplateDatabaseEvent(publishableEventRecord);
      }
      case this.routingConfigTableName: {
        return this.buildRoutingConfigDatabaseEvent(publishableEventRecord);
      }
      case this.proofRequestsTableName: {
        return this.buildProofRequestedEvent(publishableEventRecord);
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
