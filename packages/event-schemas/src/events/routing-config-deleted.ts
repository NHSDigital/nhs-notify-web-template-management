import { z } from 'zod';
import { $NHSNotifyEventEnvelope } from '../event-envelope';
import {
  $NullableRoutingConfigEventData,
  $RoutingConfigStatus,
} from '../routing-config';

const $RoutingConfigDeletedEventV1Data = z
  .intersection(
    $NullableRoutingConfigEventData,
    z.object({
      status: $RoutingConfigStatus.extract(['DELETED']),
    })
  )
  .meta({
    id: 'RoutingConfigDeletedEventData',
  });

export const $RoutingConfigDeletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.RoutingConfigDeleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/RoutingConfigDeleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $RoutingConfigDeletedEventV1Data,
});

export type RoutingConfigDeletedEventV1 = z.infer<
  typeof $RoutingConfigDeletedEventV1
>;
