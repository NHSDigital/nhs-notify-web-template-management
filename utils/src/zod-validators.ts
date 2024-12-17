import { z } from 'zod';
import { TemplateType, TemplateStatus } from './enum';

export const $Template = z.object({
  id: z.string(),
  version: z.number(),
  templateType: z.nativeEnum(TemplateType),
  templateStatus: z.nativeEnum(TemplateStatus),
  name: z.string(),
  message: z.string(),
  subject: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export const $EmailTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.EMAIL),
  subject: z.string(),
});
export const $SubmittedEmailTemplate = $EmailTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $NHSAppTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.NHS_APP),
});
export const $SubmittedNHSAppTemplate = $NHSAppTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $SMSTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.SMS),
});
export const $SubmittedSMSTemplate = $SMSTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $ChannelTemplate = z.discriminatedUnion('templateType', [
  $NHSAppTemplate,
  $EmailTemplate,
  $SMSTemplate,
]);

export const $SubmittedChannelTemplate = z.discriminatedUnion('templateType', [
  $SubmittedNHSAppTemplate,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
]);

export const isTemplateValid = (
  input: unknown
): z.infer<typeof $Template> | undefined => $Template.safeParse(input).data;
