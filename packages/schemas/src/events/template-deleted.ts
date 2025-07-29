import { z } from 'zod';
import { $Template, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $TemplateDeletedEventData = z.intersection(
  $Template,
  z.object({
    templateStatus: $TemplateStatus.extract(['DELETED']),
  })
);

export const $TemplateDeletedEvent = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDeleted.v1'),
  dataschema: z.enum([
    'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json',
  ]),
  dataschemaversion: z.literal('1.0.0'),
  plane: z.literal('data'),
  data: $TemplateDeletedEventData,
});

export type TemplateDeletedEvent = z.infer<typeof $TemplateDeletedEvent>;
