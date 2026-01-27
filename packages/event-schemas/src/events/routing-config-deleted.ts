import { z } from 'zod';
import { $NHSNotifyEventEnvelope } from '../event-envelope';
import { $DraftRoutingConfigEventData } from '../routing-config';

export const $RoutingConfigDeletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.RoutingConfigDeleted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/RoutingConfigDeleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $DraftRoutingConfigEventData,
});

export type RoutingConfigDeletedEventV1 = z.infer<
  typeof $RoutingConfigDeletedEventV1
>;
