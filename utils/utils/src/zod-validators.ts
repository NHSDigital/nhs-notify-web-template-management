import { z } from 'zod';
import {
  $TemplateDTOSchema,
  Language,
  LetterType,
  TemplateDTO,
} from 'nhs-notify-backend-client';
import { TemplateType, TemplateStatus } from './enum';

export const $Template = z.object({
  id: z.string(),
  templateType: z.nativeEnum(TemplateType),
  templateStatus: z.nativeEnum(TemplateStatus),
  name: z.string(),
  subject: z.string().optional(),
  message: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  letterType: z.nativeEnum(LetterType).optional(),
  language: z.nativeEnum(Language).optional(),
  pdfTemplateInputFile: z.string().optional(),
  testPersonalisationInputFile: z.string().optional(),
});

export const $EmailTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.EMAIL),
  subject: z.string(),
  message: z.string(),
});
export const $SubmittedEmailTemplate = $EmailTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $NHSAppTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.NHS_APP),
  message: z.string(),
});
export const $SubmittedNHSAppTemplate = $NHSAppTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $SMSTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.SMS),
  message: z.string(),
});
export const $SubmittedSMSTemplate = $SMSTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $LetterTemplate = $Template.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
  templateType: z.literal(TemplateType.LETTER),
  letterType: z.nativeEnum(LetterType),
  language: z.nativeEnum(Language),
  pdfTemplateInputFile: z.string(),
  testPersonalisationInputFile: z.string(),
});
export const $SubmittedLetterTemplate = $LetterTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});

export const $ChannelTemplate = z.discriminatedUnion('templateType', [
  $NHSAppTemplate,
  $EmailTemplate,
  $SMSTemplate,
  $LetterTemplate,
]);

export const $SubmittedChannelTemplate = z.discriminatedUnion('templateType', [
  $SubmittedNHSAppTemplate,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
  $SubmittedLetterTemplate,
]);

export const isTemplateValid = (input: unknown): TemplateDTO | undefined =>
  $TemplateDTOSchema.safeParse(input).data;
