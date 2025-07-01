import fs from 'node:fs';
import path from 'node:path';
import { MessageProviderPact } from '@pact-foundation/pact';
import { createUserCreatedEvent } from '../../../src/auth/events/user-created.event';

describe('Pact Message Provider - UserCreated Event', () => {
  const pactDir = path.resolve(__dirname, '.pacts');

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
