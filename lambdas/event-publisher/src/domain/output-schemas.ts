import {
  $TemplateCompletedEvent,
  $TemplateDeletedEvent,
  $TemplateDraftedEvent,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { z } from 'zod';

// the lambda doesn't necessarily have to only publish TemplateSaved events but
// that's all it is doing at the moment
export const $Event = z.discriminatedUnion('type', [
  $TemplateCompletedEvent,
  $TemplateDraftedEvent,
  $TemplateDeletedEvent,
]);
export type Event = z.infer<typeof $Event>;
