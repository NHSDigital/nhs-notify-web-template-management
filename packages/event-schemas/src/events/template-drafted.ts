import { z } from 'zod';
import { $TemplateEventV1Data, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

const $TemplateDraftedEventV1Data = z
  .intersection(
    $TemplateEventV1Data,
    z.object({
      templateStatus: $TemplateStatus.exclude(['SUBMITTED', 'DELETED']),
    })
  )
  .meta({
    id: 'TemplateDraftedEventData',
  });

export const $TemplateDraftedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDrafted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDrafted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateDraftedEventV1Data,
});

export type TemplateDraftedEventV1 = z.infer<typeof $TemplateDraftedEventV1>;
