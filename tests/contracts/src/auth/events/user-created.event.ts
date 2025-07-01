import { randomUUID } from 'node:crypto';

export function createUserCreatedEvent() {
  return {
    'detail-type': 'UserCreated',
    source: 'uk.nhs.notify.auth',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      clientId: randomUUID(),
      userId: randomUUID(),
    },
  };
}
