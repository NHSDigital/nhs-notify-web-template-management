import { z } from 'zod';
import { $NHSNotifyEventEnvelope } from '../event-envelope';
import { $RoutingConfigEventV1Data } from '../routing-config';

export const $RoutingConfigDraftedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.RoutingConfigDrafted.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/RoutingConfigDrafted/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('control'),
  data: $RoutingConfigEventV1Data,
});

export type RoutingConfigDraftedEventV1 = z.infer<
  typeof $RoutingConfigDraftedEventV1
>;
