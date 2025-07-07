import { z } from 'zod';

// I guess this would be defined in the handler source code in the event consumer and imported here
// Handlers should parse the incoming event before doing anything else
export const $UserCreatedEvent = z.object({
  'detail-type': z.literal('UserCreated'),
  detail: z.object({
    userId: z.string().uuid(),
    clientId: z.string().uuid(),
  }),
});

export async function handleUserCreatedEvent(event: unknown): Promise<void> {
  $UserCreatedEvent.parse(event);

  // Handler logic goes here
}
