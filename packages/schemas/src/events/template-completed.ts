import { z } from 'zod';
import { $Template, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateCompletedEventData = z.intersection(
  $Template,
  z.object({
    templateStatus: $TemplateStatus.extract(['SUBMITTED']),
  })
);

export const $TemplateCompletedEvent = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateCompleted.v1'),
  dataschema: z.enum([
    'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json',
  ]),
  dataschemaversion: z.literal('1.0.0'),
  plane: z.literal('data'),
  data: $TemplateCompletedEventData,
});

export type TemplateCompletedEvent = z.infer<typeof $TemplateCompletedEvent>;
