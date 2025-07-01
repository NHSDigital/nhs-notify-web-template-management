import { z } from 'zod';

export const $TemplateDeletedEvent = z.object({
  'detail-type': z.literal('TemplateDeleted'),
  version: z.literal('1.0'),
  detail: z.object({
    id: z.string().uuid(),
    owner: z.string().uuid(),
  }),
});

export async function handleTemplateDeleted(event: unknown): Promise<void> {
  $TemplateDeletedEvent.parse(event);

  // Handler logic goes here
}
