import { z } from 'zod';
import {
  BaseTemplate,
  CreateLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
  VersionedFileDetails,
  FileDetails,
  LetterFiles,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
} from '../types/generated';
import {
  MAX_EMAIL_CHARACTER_LENGTH,
  MAX_NHS_APP_CHARACTER_LENGTH,
  MAX_SMS_CHARACTER_LENGTH,
  NHS_APP_DISALLOWED_CHARACTERS,
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
  (EmailProperties | NhsAppProperties | SmsProperties | CreateLetterProperties);

export type ValidatedTemplateDto = TemplateDto &
  (EmailProperties | NhsAppProperties | SmsProperties | LetterProperties);

const $FileDetails = schemaFor<FileDetails>()(
  z.object({
    fileName: z.string().trim().min(1),
    virusScanStatus: z.enum(VIRUS_SCAN_STATUS_LIST),
  })
);

const $VersionedFileDetails = schemaFor<VersionedFileDetails>()(
  $FileDetails.extend({
    currentVersion: z.string(),
  })
);

export const $LetterFiles = schemaFor<LetterFiles>()(
  z.object({
    pdfTemplate: $VersionedFileDetails,
    testDataCsv: $VersionedFileDetails.optional(),
    proofs: z.record($FileDetails).optional(),
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
    message: z
      .string()
      .trim()
      .min(1)
      .max(MAX_NHS_APP_CHARACTER_LENGTH)
      // eslint-disable-next-line security/detect-non-literal-regexp
      .refine((s) => !new RegExp(NHS_APP_DISALLOWED_CHARACTERS, 'gi').test(s), {
        message: `Message contains disallowed characters. Disallowed characters: ${NHS_APP_DISALLOWED_CHARACTERS}`,
      }),
  })
);

export const $SmsProperties = schemaFor<SmsProperties>()(
  z.object({
    templateType: z.literal('SMS'),
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $CreateLetterProperties = schemaFor<CreateLetterProperties>()(
  z.object({
    templateType: z.literal('LETTER'),
    letterType: z.enum(LETTER_TYPE_LIST),
    language: z.enum(LANGUAGE_LIST),
  })
);

export const $LetterProperties = schemaFor<LetterProperties>()(
  $CreateLetterProperties.extend({
    files: $LetterFiles,
    personalisationParameters: z.array(z.string()).optional(),
  })
);

export const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: z.string().trim().min(1),
    templateType: z.enum(TEMPLATE_TYPE_LIST),
    clientId: z.string(),
    userId: z.string(),
  })
);

export const $CreateUpdateNonLetter = schemaFor<
  Exclude<CreateUpdateTemplate, { templateType: 'LETTER' }>,
  Exclude<ValidatedCreateUpdateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppProperties),
    $BaseTemplateSchema.merge($EmailProperties),
    $BaseTemplateSchema.merge($SmsProperties),
  ])
);

export const $CreateUpdateTemplate = schemaFor<
  CreateUpdateTemplate,
  ValidatedCreateUpdateTemplate
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppProperties),
    $BaseTemplateSchema.merge($EmailProperties),
    $BaseTemplateSchema.merge($SmsProperties),
    $BaseTemplateSchema.merge($CreateLetterProperties),
  ])
);

const $TemplateDtoFields = z
  .object({
    id: z.string().trim().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    templateStatus: z.enum(TEMPLATE_STATUS_LIST),
  })
  .merge($BaseTemplateSchema);

export const $TemplateDtoSchema = schemaFor<
  TemplateDto,
  ValidatedTemplateDto
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
