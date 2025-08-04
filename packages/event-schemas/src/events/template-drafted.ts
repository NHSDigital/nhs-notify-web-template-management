import { z } from 'zod';
import { $Template, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateDraftedEventData = z.intersection(
  $Template,
  z.object({
    templateStatus: $TemplateStatus.exclude(['SUBMITTED', 'DELETED']),
  })
);

export const $TemplateDraftedEvent = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDrafted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDrafted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateDraftedEventData,
});

export type TemplateDraftedEvent = z.infer<typeof $TemplateDraftedEvent>;
