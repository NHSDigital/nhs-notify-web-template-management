import { z } from 'zod';
import { $TemplateEventV1Data } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateDeletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDeleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateEventV1Data,
});

export type TemplateDeletedEventV1 = z.infer<typeof $TemplateDeletedEventV1>;
