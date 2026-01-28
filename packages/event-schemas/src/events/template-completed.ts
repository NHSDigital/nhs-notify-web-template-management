import { z } from 'zod';
import { $TemplateEventV1Data } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateCompletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateCompleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateEventV1Data,
});

export type TemplateCompletedEventV1 = z.infer<
  typeof $TemplateCompletedEventV1
>;
