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
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateCompletedEventData,
});

export type TemplateCompletedEvent = z.infer<typeof $TemplateCompletedEvent>;
