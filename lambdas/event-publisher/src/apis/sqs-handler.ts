import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { SQSHandler, SQSBatchItemFailure } from 'aws-lambda';
import { App } from '../app/app';
import { $PublishableEventRecord } from '../domain/input-schemas';

export const createHandler =
  ({ app, logger }: { app: App; logger: Logger }): SQSHandler =>
  async (event) => {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
      try {
        const sqsRecord: unknown = JSON.parse(record.body);

        const publishableEventRecord = $PublishableEventRecord.parse(sqsRecord);

        await app.publishEvent(publishableEventRecord);
      } catch (error) {
        logger.error(error);
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };
