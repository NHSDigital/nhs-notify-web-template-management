import { z } from 'zod';
import { $TemplateSavedDataFields } from './common-template-schemas';
import { $EventMetadata } from '../base-metadata-schemas';

export const $TemplateCompletedEventData = z.intersection(
  $TemplateSavedDataFields,
  z.object({
    templateStatus: z.literal('SUBMITTED'),
  })
);

const $TemplateCompletedEventMetadata = $EventMetadata.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateCompleted.v1'),
  dataschema: z.enum([
    'https://notify.nhs.uk/events/schemas/template-completed/v1.json',
  ]),
  dataschemaversion: z.literal('1.0.0'),
});

export const $TemplateCompletedEvent = $TemplateCompletedEventMetadata.extend({
  data: $TemplateCompletedEventData,
});
