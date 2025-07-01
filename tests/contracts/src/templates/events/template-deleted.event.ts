import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const $TemplateDeletedEvent = z.object({
  'detail-type': z.literal('TemplateDeleted'),
  source: z.literal('uk.nhs.notify.templates'),
  time: z.string().datetime(),
  version: z.string().default('1.0'),
  detail: z.object({
    id: z.string().uuid(),
    owner: z.string().uuid(),
  }),
});

export type TemplateDeletedEvent = z.infer<typeof $TemplateDeletedEvent>;

export function createTemplateDeletedEvent(): TemplateDeletedEvent {
  return $TemplateDeletedEvent.parse({
    'detail-type': 'TemplateDeleted',
    source: 'uk.nhs.notify.templates',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      owner: randomUUID(),
      id: randomUUID(),
    },
  });
}
