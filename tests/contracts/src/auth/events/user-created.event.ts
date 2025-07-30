import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const $UserCreatedEvent = z.object({
  'detail-type': z.literal('UserCreated'),
  source: z.literal('uk.nhs.notify.auth'),
  time: z.string().datetime(),
  version: z.string().default('1.0'),
  detail: z.object({
    clientId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export type UserCreatedEvent = z.infer<typeof $UserCreatedEvent>;

export function createUserCreatedEvent(): UserCreatedEvent {
  return $UserCreatedEvent.parse({
    'detail-type': 'UserCreated',
    source: 'uk.nhs.notify.auth',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      clientId: randomUUID(),
      userId: randomUUID(),
    },
  });
}
