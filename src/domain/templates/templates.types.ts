import { z } from 'zod';

const baseFields = z.object({
  body: z.string(),
});

export const $Template = z.object({
  name: z.string(),
  type: z.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER']),
  version: z.number(),
  fields: baseFields,
});

export const $NHSAppTemplateSchema = $Template.extend({
  type: z.literal('NHS_APP'),
});

export type Template = z.infer<typeof $Template>;

export type NHSAppTemplate = Template & z.infer<typeof $NHSAppTemplateSchema>;
