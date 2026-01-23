import { z } from 'zod';
import { $NHSNotifyEventEnvelope } from '../event-envelope';
import {
  $CompletedRoutingConfigEventData,
} from '../routing-config';

export const $RoutingConfigCompletedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal(
    'uk.nhs.notify.template-management.RoutingConfigCompleted.v1'
  ),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/RoutingConfigCompleted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $CompletedRoutingConfigEventData,
});

export type RoutingConfigCompletedEventV1 = z.infer<
  typeof $RoutingConfigCompletedEventV1
>;
