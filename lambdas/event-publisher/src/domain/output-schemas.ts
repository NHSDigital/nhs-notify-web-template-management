import { z } from 'zod';
import { $TemplateCompletedEvent } from './individual-event-schemas/template-completed';
import { $TemplateDeletedEvent } from './individual-event-schemas/template-deleted';
import { $TemplateDraftedEvent } from './individual-event-schemas/template-drafted';

// the lambda doesn't necessarily have to only publish TemplateSaved events but
// that's all it is doing at the moment
export const $Event = z.discriminatedUnion('type', [
  $TemplateCompletedEvent,
  $TemplateDraftedEvent,
  $TemplateDeletedEvent,
]);
export type Event = z.infer<typeof $Event>;
