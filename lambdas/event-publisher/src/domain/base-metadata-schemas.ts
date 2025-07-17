import { z } from 'zod';

const $EventMetadataVersionInformation = z.object({
  dataschema: z.string(),
  dataschemaversion: z.string(),
  type: z.string(),
});
export type EventMetadataVersionInformation = z.infer<
  typeof $EventMetadataVersionInformation
>;

export const $EventMetadata = $EventMetadataVersionInformation.extend({
  id: z.string(),
  source: z.string(),
  specversion: z.literal('1.0'),
  subject: z.string(),
  time: z.string(),
  datacontenttype: z.literal('application/json'),
  plane: z.literal('control'),
});
export type EventMetadata = z.infer<typeof $EventMetadata>;
