import type { SQSHandler } from 'aws-lambda';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { App } from '../app/app';
import { $RenderRequest } from 'nhs-notify-backend-client/src/schemas/render-request';

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

    const request = $RenderRequest.parse(JSON.parse(event.Records[0].body));

    if (request.requestType !== 'initial') {
      return;
    }

    await app.renderInitial(request);
  };
}
