import path from 'node:path';
import {
  MessageConsumerPact,
  Matchers,
  asynchronousBodyHandler,
} from '@pact-foundation/pact';
import { z } from 'zod';

// I guess this would be defined in the handler source code in the event consumer and imported here
// Handlers should parse the incoming event before doing anything else
const $TemplateDeletedEvent = z.object({
  'detail-type': z.literal('TemplateDeleted'),
  version: z.literal('1.0'),
  detail: z.object({
    id: z.string().uuid(),
    owner: z.string().uuid(),
  }),
});

// Simulate consumer handler that processes the incoming event
// Only check the validation - don't run actual handler logic
async function handleTemplateDeleted(event: unknown): Promise<void> {
  $TemplateDeletedEvent.parse(event);
}

describe('Pact Message Consumer - TemplateDeleted Event', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'auth',
    provider: 'templates',
    dir: path.resolve(__dirname, 'pacts'),
    pactfileWriteMode: 'update',
    logLevel: 'error',
  });

  it('should validate the template deleted event structure and handler logic', async () => {
    await messagePact
      .given('A template has been deleted')
      .expectsToReceive('TemplateDeleted')
      .withContent({
        'detail-type': 'TemplateDeleted',
        version: '1.0',
        detail: {
          owner: Matchers.uuid('c0574019-4629-4b3f-8987-aa34ca8bc5b9'),
          id: Matchers.uuid('b18a9a49-72a8-4157-8b85-76d5ac5c7804'),
        },
      })
      .verify(asynchronousBodyHandler(handleTemplateDeleted));
  });
});
