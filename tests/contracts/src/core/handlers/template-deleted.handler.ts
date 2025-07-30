import { z } from 'zod';

// Handlers should define their own minimal input validators
// Decoupled from implementations in other services
// So this is slightly different to what's defined in the templates service which produces the event
// And different to the TemplateDeleted handler in the auth service

export const $TemplateDeletedEvent = z.object({
  'detail-type': z.literal('TemplateDeleted'),
  detail: z.object({
    id: z.string().uuid(),
    owner: z.string().uuid(),
  }),
});

export async function handleTemplateDeleted(event: unknown): Promise<void> {
  $TemplateDeletedEvent.parse(event);

  // Handler logic goes here
}
