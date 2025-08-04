import { z } from 'zod';
import { $TemplateSavedDataFields } from './common-template-schemas';
import { $EventMetadata } from '../base-metadata-schemas';

export const $TemplateDeletedEventData = z.intersection(
  $TemplateSavedDataFields,
  z.object({
    templateStatus: z.literal('DELETED'),
  })
);
const $TemplateDeletedEventMetadata = $EventMetadata.extend({
  type: z.literal('uk.nhs.notify.template-management.TemplateDeleted.v1'),
  dataschema: z.enum([
    'https://notify.nhs.uk/events/schemas/template-deleted/v1.json',
  ]),
  dataschemaversion: z.literal('1.1.0'),
});

export const $TemplateDeletedEvent = $TemplateDeletedEventMetadata.extend({
  data: $TemplateDeletedEventData,
});
