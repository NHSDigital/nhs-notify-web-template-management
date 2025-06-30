import path from 'node:path';
import {
  MessageConsumerPact,
  Matchers,
  asynchronousBodyHandler,
} from '@pact-foundation/pact';
import { z } from 'zod';

// I guess this would be defined in the handler source code in the event consumer and imported here
// Handlers should parse the incoming event before doing anything else
const $UserCreatedEvent = z.object({
  'detail-type': z.literal('UserCreated'),
  detail: z.object({
    userId: z.string().uuid(),
    clientId: z.string().uuid(),
  }),
});

// Simulate consumer handler that processes the incoming event
// Only check the validation - don't run actual handler logic
async function handleUserCreated(event: unknown): Promise<void> {
  $UserCreatedEvent.parse(event);
}

describe('Pact Message Consumer - UserCreated Event', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'templates',
    provider: 'auth',
    dir: path.resolve(__dirname, 'pacts'),
    pactfileWriteMode: 'update',
    logLevel: 'error',
  });

  it('should validate the template deleted event structure and handler logic', async () => {
    await messagePact
      .given('a user has been created')
      .expectsToReceive('UserCreated')
      .withContent({
        'detail-type': 'UserCreated',
        detail: {
          userId: Matchers.uuid('eec2e415-dbb2-4e4d-9afb-ab64e280a3c9'),
          clientId: Matchers.uuid('f5a3daf2-8fa5-4582-ba2c-478eea955b6f'),
        },
      })
      .verify(asynchronousBodyHandler(handleUserCreated));
  });
});
