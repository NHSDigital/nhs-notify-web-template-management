import fs from 'node:fs';
import path from 'node:path';
import { MessageProviderPact } from '@pact-foundation/pact';
import { createTemplateDeletedEvent } from '../../../src/templates/events/template-deleted.event';

describe('Pact Message Provider - TemplateDeleted Event', () => {
  const pactDir = path.resolve(__dirname, 'pacts');

  const messagePact = new MessageProviderPact({
    provider: 'templates',
    pactUrls: fs
      .readdirSync(pactDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(pactDir, f)),
    messageProviders: {
      TemplateDeleted: () => createTemplateDeletedEvent(),
    },
    logLevel: 'error',
  });

  it('should produce a message that satisfies the consumer contracts for TemplateDeleted', () => {
    return messagePact.verify();
  });
});
