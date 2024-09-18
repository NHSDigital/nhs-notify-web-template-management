import { z } from 'zod';

const baseFields = z.object({
  content: z.string(),
});

const $BaseTemplateInput = z.object({
  name: z.string(),
  type: z.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER']),
  version: z.number(),
  fields: baseFields,
});

const $NHSAppTemplateInput = $BaseTemplateInput.extend({
  type: z.literal('NHS_APP'),
});

const $EmailTemplateInput = $BaseTemplateInput.extend({
  type: z.literal('EMAIL'),
});

const $SMSTemplateInput = $BaseTemplateInput.extend({
  type: z.literal('SMS'),
});

const $LetterTemplateInput = $BaseTemplateInput.extend({
  type: z.literal('LETTER'),
});

export const $TemplateInput = z.discriminatedUnion('type', [
  $NHSAppTemplateInput,
  $EmailTemplateInput,
  $SMSTemplateInput,
  $LetterTemplateInput,
]);

export const $Template = $TemplateInput.and(z.object({ id: z.string() }));

export type TemplateInput = z.infer<typeof $TemplateInput>;
export type Template = z.infer<typeof $Template>;

export type NHSAppTemplateInpu = Template & z.infer<typeof $NHSAppTemplateInput>;
