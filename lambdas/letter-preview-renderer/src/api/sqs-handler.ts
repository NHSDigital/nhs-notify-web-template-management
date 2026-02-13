import type { SQSHandler } from 'aws-lambda';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { App } from '../app/app';

type Dependencies = {
  app: App;
  logger: Logger;
};

export function createHandler({ app, logger }: Dependencies): SQSHandler {
  return async function (event) {
    const recordCount = event.Records.length;

    if (recordCount !== 1) {
      const msg = 'Event contained unexpected number of events';

      logger.child({ event, recordCount }).error(msg);

      throw new Error(msg);
    }
  };
}
