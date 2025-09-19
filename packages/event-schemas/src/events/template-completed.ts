import { z } from 'zod';
import { $TemplateEventV1Data, $TemplateStatus } from '../template';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

const $TemplateCompletedEventV1Data = z
  .intersection(
    $TemplateEventV1Data,
    z.object({
      templateStatus: $TemplateStatus.extract(['SUBMITTED']),
    })
  )
  .meta({
    id: 'TemplateCompletedEventData',
  });

export const $TemplateCompletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateCompleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $TemplateCompletedEventV1Data,
});

export type TemplateCompletedEventV1 = z.infer<
  typeof $TemplateCompletedEventV1
>;
