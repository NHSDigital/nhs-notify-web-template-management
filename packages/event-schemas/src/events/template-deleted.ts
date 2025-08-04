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
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateDeletedEventData,
});

export type TemplateDeletedEvent = z.infer<typeof $TemplateDeletedEvent>;
