import { z } from 'zod';
import { $TemplateEventV1Data, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

const $TemplateDeletedEventV1Data = z
  .intersection(
    $TemplateEventV1Data,
    z.object({
      templateStatus: $TemplateStatus.extract(['DELETED']),
    })
  )
  .meta({
    id: 'TemplateDeletedEventData',
  });

export const $TemplateDeletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDeleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateDeletedEventV1Data,
});

export type TemplateDeletedEventV1 = z.infer<typeof $TemplateDeletedEventV1>;
