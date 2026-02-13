import type { SQSHandler } from 'aws-lambda';
import z from 'zod';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { App } from '../app/app';

type Dependencies = {
  app: App;
  logger: Logger;
};

const $Common = z.object({
  templateId: z.string(),
  clientId: z.string(),
});

const $InitialRenderRequest = $Common.extend({
  requestType: z.literal('intial'),
});

const $PersonalisedRenderRequest = $Common.extend({
  requestType: z.literal('personalised'),
});

// move to shared location, derive type
const $RenderRequest = z.discriminatedUnion('requestType', [
  $InitialRenderRequest,
  $PersonalisedRenderRequest,
]);

export function createHandler({ app, logger }: Dependencies): SQSHandler {
  return async function (event) {
    const recordCount = event.Records.length;

    if (recordCount !== 1) {
      const msg = 'Event contained unexpected number of events';

      logger.child({ event, recordCount }).error(msg);

      throw new Error(msg);
    }

    const request = $RenderRequest.parse(JSON.parse(event.Records[0].body));

    if (request.requestType === 'personalised') {
      return;
    }

    const result = await app.initialRender();

    if (!result.ok) {
      throw new Error('failed');
    }
  };
}
