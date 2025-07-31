import { z } from 'zod';
import { $TemplateSavedDataFields } from './common-template-schemas';
import { $EventMetadata } from '../base-metadata-schemas';
import { templateStatuses } from './common-template-schemas';

export const $TemplateDraftedEventData = z.intersection(
  $TemplateSavedDataFields,
  z.object({
    templateStatus: z.enum(templateStatuses).exclude(['SUBMITTED', 'DELETED']),
  })
);

const $TemplateDraftedEventMetadata = $EventMetadata.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDrafted.v1'),
  dataschema: z.enum([
    'https://notify.nhs.uk/events/schemas/template-drafted/v1.json',
  ]),
  dataschemaversion: z.literal('1.0.1'),
});

export const $TemplateDraftedEvent = $TemplateDraftedEventMetadata.extend({
  data: $TemplateDraftedEventData,
});
