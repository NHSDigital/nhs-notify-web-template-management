import { z } from 'zod';
import {
  $TemplateDTOSchema,
  Language,
  LetterType,
  TemplateDTO,
  VirusScanStatus,
} from 'nhs-notify-backend-client';
import { TemplateType, TemplateStatus } from './enum';

const $TemplateBase = z.object({
  id: z.string(),
  templateType: z.nativeEnum(TemplateType),
  templateStatus: z.nativeEnum(TemplateStatus),
  name: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const $VirusScanStatus = z.nativeEnum(VirusScanStatus);

const $File = z.object({
  fileName: z.string(),
  currentVersion: z.string().optional(),
  virusScanStatus: $VirusScanStatus,
});

const $Files = z.object({
  pdfTemplate: $File,
  testDataCsv: $File.optional(),
  proofs: z.array($File).optional(),
});

export const $EmailTemplate = $TemplateBase.extend({
  templateType: z.literal(TemplateType.EMAIL),
  subject: z.string(),
  message: z.string(),
});
export const $SubmittedEmailTemplate = $EmailTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});
export const $NonSubmittedEmailTemplate = $EmailTemplate.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
});

export const $NHSAppTemplate = $TemplateBase.extend({
  templateType: z.literal(TemplateType.NHS_APP),
  message: z.string(),
});
export const $SubmittedNHSAppTemplate = $NHSAppTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});
export const $NonSubmittedNHSAppTemplate = $NHSAppTemplate.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
});

export const $SMSTemplate = $TemplateBase.extend({
  templateType: z.literal(TemplateType.SMS),
  message: z.string(),
});
export const $SubmittedSMSTemplate = $SMSTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});
const $NonSubmittedSMSTemplate = $SMSTemplate.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
});

export const $LetterTemplate = $TemplateBase.extend({
  templateType: z.literal(TemplateType.LETTER),
  letterType: z.nativeEnum(LetterType),
  language: z.nativeEnum(Language),
  files: $Files,
});
const $SubmittedLetterTemplate = $LetterTemplate.extend({
  templateStatus: z.literal(TemplateStatus.SUBMITTED),
});
const $NonSubmittedLetterTemplate = $LetterTemplate.extend({
  templateStatus: z.literal(TemplateStatus.NOT_YET_SUBMITTED),
});

export const $Template = z.discriminatedUnion('templateType', [
  $NHSAppTemplate,
  $EmailTemplate,
  $SMSTemplate,
  $LetterTemplate,
]);

export const $SubmittedTemplate = z.discriminatedUnion('templateType', [
  $SubmittedNHSAppTemplate,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
  $SubmittedLetterTemplate,
]);

export const $NonSubmittedTemplate = z.discriminatedUnion('templateType', [
  $NonSubmittedNHSAppTemplate,
  $NonSubmittedEmailTemplate,
  $NonSubmittedSMSTemplate,
  $NonSubmittedLetterTemplate,
]);

export const isTemplateValid = (input: unknown): TemplateDTO | undefined =>
  $TemplateDTOSchema.safeParse(input).data;
