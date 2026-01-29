import { z } from 'zod';
import { $TemplateEventV1Data } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateDraftedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDrafted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDrafted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateEventV1Data,
});

export type TemplateDraftedEventV1 = z.infer<typeof $TemplateDraftedEventV1>;
