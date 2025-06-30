import fs from 'node:fs';
import path from 'node:path';
import { MessageProviderPact } from '@pact-foundation/pact';

// This would be the actual function that produces the event payload in the producer source code
function createUserCreatedEvent() {
  return {
    'detail-type': 'UserCreated',
    source: 'uk.nhs.notify.auth',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      clientId: '3aef04e4-4491-42ae-b24a-95c66b80cbc9',
      userId: 'f58efb29-27a0-4da3-a502-ddd387771c1e',
    },
  };
}

describe('Pact Message Provider - UserCreated Event', () => {
  const pactDir = path.resolve(__dirname, 'pacts');

  const messagePact = new MessageProviderPact({
    provider: 'auth',
    pactUrls: fs
      .readdirSync(pactDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(pactDir, f)),
    messageProviders: {
      UserCreated: () => createUserCreatedEvent(),
    },
    logLevel: 'error',
  });

  it('should produce a message that satisfies the consumer contracts for UserCreated', () => {
    return messagePact.verify();
  });
});
