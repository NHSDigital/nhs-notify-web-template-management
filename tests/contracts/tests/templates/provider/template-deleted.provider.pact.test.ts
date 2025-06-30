import fs from 'node:fs';
import path from 'node:path';
import { MessageProviderPact } from '@pact-foundation/pact';

// This would be the actual function that produces the event payload in the producer source code
function createTemplateDeletedEvent() {
  return {
    'detail-type': 'TemplateDeleted',
    source: 'uk.nhs.notify.templates',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      owner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
    },
  };
}

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

  it('should produce a message that satisfies the consumer contract for TemplateDeleted', () => {
    return messagePact.verify();
  });
});
