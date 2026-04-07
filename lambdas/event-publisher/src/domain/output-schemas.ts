import {
  $ProofRequestedEventV1,
  $RoutingConfigCompletedEventV1,
  $RoutingConfigDeletedEventV1,
  $RoutingConfigDraftedEventV1,
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { z } from 'zod';

export const $Event = z.discriminatedUnion('type', [
  $ProofRequestedEventV1,
  $RoutingConfigCompletedEventV1,
  $RoutingConfigDeletedEventV1,
  $RoutingConfigDraftedEventV1,
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
]);
export type Event = z.infer<typeof $Event>;
