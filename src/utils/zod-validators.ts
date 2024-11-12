import { z } from 'zod';
import { TemplateType } from '@utils/enum';

export const $Template = z.object({
  id: z.string(),
  version: z.number(),
  templateType: z.nativeEnum(TemplateType),
  name: z.string(),
  message: z.string(),
  subject: z.string().nullable().optional(),
});

export const $EmailTemplate = $Template.extend({
  templateType: z.literal(TemplateType.EMAIL),
  subject: z.string(),
});

export const $NHSAppTemplate = $Template.extend({
  templateType: z.literal(TemplateType.NHS_APP),
});

export const $SMSTemplate = $Template.extend({
  templateType: z.literal(TemplateType.SMS),
});

export const $ChannelTemplate = z.discriminatedUnion('templateType', [
  $NHSAppTemplate,
  $EmailTemplate,
  $SMSTemplate,
]);
