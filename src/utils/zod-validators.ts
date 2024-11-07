import { z } from 'zod';
import { TemplateType } from './types';

export const $BaseTemplateFields = z.object({
  name: z.string(),
  message: z.string(),
});

export const $BaseTemplateFieldsWithSubject = $BaseTemplateFields.extend({
  subject: z.string(),
});

export const $Template = z.object({
  id: z.string(),
  version: z.number(),
  templateType: z.enum([
    'UNKNOWN',
    TemplateType.EMAIL,
    TemplateType.SMS,
    TemplateType.NHS_APP,
    TemplateType.LETTER,
  ]),
  NHS_APP: $BaseTemplateFields.optional().nullable(),
  EMAIL: $BaseTemplateFieldsWithSubject.optional().nullable(),
  SMS: $BaseTemplateFields.optional().nullable(),
  LETTER: $BaseTemplateFields.optional().nullable(),
});

export const $TypedTemplate = $Template.extend({
  templateType: z.enum([
    TemplateType.EMAIL,
    TemplateType.SMS,
    TemplateType.NHS_APP,
    TemplateType.LETTER,
  ]),
});

export const $EmailTemplate = $Template.extend({
  EMAIL: $BaseTemplateFieldsWithSubject,
  templateType: z.literal(TemplateType.EMAIL),
});

export const $NHSAppTemplate = $Template.extend({
  NHS_APP: $BaseTemplateFields,
  templateType: z.literal(TemplateType.NHS_APP),
});

export const $SMSTemplate = $Template.extend({
  SMS: $BaseTemplateFields,
  templateType: z.literal(TemplateType.SMS),
});

export const $ChannelTemplate = z.discriminatedUnion('templateType', [
  $NHSAppTemplate,
  $EmailTemplate,
  $SMSTemplate,
]);
