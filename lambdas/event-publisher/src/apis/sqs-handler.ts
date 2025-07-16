import { SQSHandler } from 'aws-lambda';
import { App } from '../app/app';
import { $PublishableEventRecord } from '../domain/input-schemas';

export const createHandler =
  ({ app }: { app: App }): SQSHandler =>
  async (event) => {
    for (const record of event.Records) {
      const sqsRecord: unknown = JSON.parse(record.body);

      const publishableEventRecord = $PublishableEventRecord.parse(sqsRecord);

      await app.publishEvent(publishableEventRecord);
    }
  };
