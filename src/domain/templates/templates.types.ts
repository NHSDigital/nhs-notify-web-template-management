import { z } from 'zod';

const baseFields = z.object({
  content: z.string(),
});

const $BaseTemplateSchema = z.object({
  name: z.string(),
  type: z.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER']),
  version: z.number(),
  fields: baseFields,
});

const $NHSAppTemplateSchema = $BaseTemplateSchema.extend({
  type: z.literal('NHS_APP'),
});

export const $TemplateSchema = z.discriminatedUnion('type', [
  $NHSAppTemplateSchema,
]);

export type Template = z.infer<typeof $BaseTemplateSchema>;

export type NHSAppTemplate = Template & z.infer<typeof $NHSAppTemplateSchema>;
