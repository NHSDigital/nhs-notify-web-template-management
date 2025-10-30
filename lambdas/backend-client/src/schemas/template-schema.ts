import { z } from 'zod/v4';
import {
  BaseTemplate,
  UploadLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
  VersionedFileDetails,
  ProofFileDetails,
  LetterFiles,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
  LetterType,
  Language,
} from '../types/generated';
import {
  MAX_EMAIL_CHARACTER_LENGTH,
  MAX_NHS_APP_CHARACTER_LENGTH,
  MAX_SMS_CHARACTER_LENGTH,
} from './constants';
import { schemaFor } from './schema-for';
import {
  LANGUAGE_LIST,
  LETTER_TYPE_LIST,
  TEMPLATE_STATUS_LIST,
  TEMPLATE_TYPE_LIST,
  VIRUS_SCAN_STATUS_LIST,
} from './union-lists';

export type ValidatedCreateUpdateTemplate = CreateUpdateTemplate &
  (EmailProperties | NhsAppProperties | SmsProperties | UploadLetterProperties);

export type ValidatedCreateUpdateTemplateNonLetter = Exclude<
  ValidatedCreateUpdateTemplate,
  { templateType: 'LETTER' }
>;

export type ValidatedTemplateDto = TemplateDto &
  (EmailProperties | NhsAppProperties | SmsProperties | LetterProperties);

export const $LetterType = schemaFor<LetterType>()(z.enum(LETTER_TYPE_LIST));

export const $Language = schemaFor<Language>()(z.enum(LANGUAGE_LIST));

const $ProofFileDetails = schemaFor<ProofFileDetails>()(
  z.object({
    fileName: z.string().trim().min(1),
    supplier: z.string(),
    virusScanStatus: z.enum(VIRUS_SCAN_STATUS_LIST),
  })
);

const $VersionedFileDetails = schemaFor<VersionedFileDetails>()(
  z.object({
    currentVersion: z.string(),
    fileName: z.string().trim().min(1),
    virusScanStatus: z.enum(VIRUS_SCAN_STATUS_LIST),
  })
);

export const $LetterFiles = schemaFor<LetterFiles>()(
  z.object({
    pdfTemplate: $VersionedFileDetails,
    testDataCsv: $VersionedFileDetails.optional(),
    proofs: z.record(z.string(), $ProofFileDetails).optional(),
  })
);

export const $EmailProperties = schemaFor<EmailProperties>()(
  z.object({
    templateType: z.literal('EMAIL'),
    subject: z.string().trim().min(1),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

export const $NhsAppProperties = schemaFor<NhsAppProperties>()(
  z.object({
    templateType: z.literal('NHS_APP'),
    message: z.string().trim().min(1).max(MAX_NHS_APP_CHARACTER_LENGTH),
  })
);

export const $SmsProperties = schemaFor<SmsProperties>()(
  z.object({
    templateType: z.literal('SMS'),
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $BaseLetterTemplateProperties = z.object({
  templateType: z.literal('LETTER'),
  letterType: z.enum(LETTER_TYPE_LIST),
  language: z.enum(LANGUAGE_LIST),
});

export const $UploadLetterProperties = schemaFor<UploadLetterProperties>()(
  $BaseLetterTemplateProperties.extend({
    campaignId: z.string(),
  })
);

export const $LetterProperties = schemaFor<LetterProperties>()(
  $BaseLetterTemplateProperties.extend({
    files: $LetterFiles,
    personalisationParameters: z.array(z.string()).optional(),
    proofingEnabled: z.boolean().optional(),
  })
);

export const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: z.string().trim().min(1),
    templateType: z.enum(TEMPLATE_TYPE_LIST),
  })
);

export const $CreateUpdateNonLetter = schemaFor<
  ValidatedCreateUpdateTemplateNonLetter,
  Exclude<CreateUpdateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppProperties),
    $BaseTemplateSchema.merge($EmailProperties),
    $BaseTemplateSchema.merge($SmsProperties),
  ])
);

export const $CreateUpdateTemplate = schemaFor<
  ValidatedCreateUpdateTemplate,
  CreateUpdateTemplate
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppProperties),
    $BaseTemplateSchema.merge($EmailProperties),
    $BaseTemplateSchema.merge($SmsProperties),
    $BaseTemplateSchema.merge($UploadLetterProperties),
  ])
);

export const $LockNumber = z.coerce
  .string()
  .trim()
  .min(1)
  .transform(Number)
  .pipe(z.number().int().min(0));

const $TemplateDtoFields = z
  .object({
    campaignId: z.string().optional(),
    clientId: z.string().optional(),
    createdAt: z.string(),
    lockNumber: $LockNumber.default(0),
    id: z.string().trim().min(1),
    templateStatus: z.enum(TEMPLATE_STATUS_LIST),
    updatedAt: z.string(),
  })
  .merge($BaseTemplateSchema);

export const $TemplateDtoSchema = schemaFor<
  TemplateDto,
  Omit<ValidatedTemplateDto, 'lockNumber'>
>()(
  z.discriminatedUnion('templateType', [
    $TemplateDtoFields.merge($NhsAppProperties),
    $TemplateDtoFields.merge($EmailProperties),
    $TemplateDtoFields.merge($SmsProperties),
    $TemplateDtoFields.merge($LetterProperties),
  ])
);

export const isCreateUpdateTemplateValid = (
  input: unknown
): ValidatedCreateUpdateTemplate | undefined =>
  $CreateUpdateTemplate.safeParse(input).data;

export const isTemplateDtoValid = (
  input: unknown
): ValidatedTemplateDto | undefined => $TemplateDtoSchema.safeParse(input).data;
