import path from 'node:path';
import {
  MessageConsumerPact,
  Matchers,
  asynchronousBodyHandler,
} from '@pact-foundation/pact';
import { $TemplateDeletedEvent } from '../../../src/core/handlers/template-deleted.handler';

// Stub of handler that processes the incoming event
// Only check the validation - don't run actual handler logic
async function handleTemplateDeleted(event: unknown): Promise<void> {
  $TemplateDeletedEvent.parse(event);
}

describe('Pact Message Consumer - TemplateDeleted Event', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'core',
    provider: 'templates',
    dir: path.resolve(__dirname, '.pacts'),
    pactfileWriteMode: 'update',
    logLevel: 'error',
  });

  it('should validate the template deleted event structure and handler logic', async () => {
    await messagePact
      .given('a template has been deleted')
      .expectsToReceive('TemplateDeleted')
      .withContent({
        'detail-type': 'TemplateDeleted',
        detail: {
          owner: Matchers.uuid('c0574019-4629-4b3f-8987-aa34ca8bc5b9'),
          id: Matchers.uuid('b18a9a49-72a8-4157-8b85-76d5ac5c7804'),
        },
      })
      .verify(asynchronousBodyHandler(handleTemplateDeleted));
  });
});
