import {
  $RoutingConfigCompletedEventV1,
  $RoutingConfigDeletedEventV1,
  $RoutingConfigDraftedEventV1,
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { z } from 'zod';

// the lambda doesn't necessarily have to only publish TemplateSaved events but
// that's all it is doing at the moment
export const $Event = z.discriminatedUnion('type', [
  $TemplateCompletedEventV1,
  $TemplateDraftedEventV1,
  $TemplateDeletedEventV1,
  $RoutingConfigCompletedEventV1,
  $RoutingConfigDraftedEventV1,
  $RoutingConfigDeletedEventV1,
]);
export type Event = z.infer<typeof $Event>;
