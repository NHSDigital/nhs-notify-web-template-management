import { z } from 'zod';
import {
  BaseTemplate,
  CreateTemplate,
  EmailProperties,
  FileDetails,
  LetterFiles,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
  UpdateTemplate,
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
} from '../types/union-lists';

const [firstTemplateType, ...remainingTemplateTypes] = TEMPLATE_TYPE_LIST;
const [firstTemplateStatus, ...remainingTemplateStatuses] =
  TEMPLATE_STATUS_LIST;
const [firstLanguage, ...remainingLanguages] = LANGUAGE_LIST;
const [firstLetterType, ...remainingLetterTypes] = LETTER_TYPE_LIST;
const [firstVirusScanStatus, ...remainingVirusScanStatus] =
  VIRUS_SCAN_STATUS_LIST;

const $FileDetails = schemaFor<FileDetails>()(
  z.object({
    fileName: z.string().trim().min(1),
    currentVersion: z.string().optional(),
    virusScanStatus: z
      .enum([firstVirusScanStatus, ...remainingVirusScanStatus])
      .optional(),
  })
);

const $LetterFiles = schemaFor<LetterFiles>()(
  z.object({
    pdfTemplate: $FileDetails,
    testDataCsv: $FileDetails.optional(),
    proofs: z.array($FileDetails).optional(),
  })
);

export const $EmailProperties = schemaFor<EmailProperties>()(
  z.object({
    subject: z.string().trim().min(1),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

export const $NhsAppProperties = schemaFor<NhsAppProperties>()(
  z.object({
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
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $LetterProperties = schemaFor<LetterProperties>()(
  z.object({
    letterType: z.enum([firstLetterType, ...remainingLetterTypes]),
    language: z.enum([firstLanguage, ...remainingLanguages]),
    files: $LetterFiles,
  })
);

export const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: z.string().trim().min(1),
    templateType: z.enum([firstTemplateType, ...remainingTemplateTypes]),
  })
);

const $EmailPropertiesWithType = $EmailProperties.merge(
  z.object({ templateType: z.literal('EMAIL') })
);
const $NhsAppPropertiesWithType = $NhsAppProperties.merge(
  z.object({ templateType: z.literal('NHS_APP') })
);
const $SmsPropertiesWithType = $SmsProperties.merge(
  z.object({ templateType: z.literal('SMS') })
);
const $LetterPropertiesWithType = $LetterProperties.merge(
  z.object({ templateType: z.literal('LETTER') })
);

export const $CreateTemplateSchema = schemaFor<CreateTemplate>()(
  z.union([
    $BaseTemplateSchema.merge($EmailPropertiesWithType),
    $BaseTemplateSchema.merge($NhsAppPropertiesWithType),
    $BaseTemplateSchema.merge($SmsPropertiesWithType),
    $BaseTemplateSchema.merge($LetterPropertiesWithType),
  ])
);

const $UpdateTemplateFields = z
  .object({
    templateStatus: z.enum([firstTemplateStatus, ...remainingTemplateStatuses]),
  })
  .merge($BaseTemplateSchema);

export const $UpdateTemplateSchema = schemaFor<UpdateTemplate>()(
  z.union([
    $UpdateTemplateFields.merge($EmailPropertiesWithType),
    $UpdateTemplateFields.merge($NhsAppPropertiesWithType),
    $UpdateTemplateFields.merge($SmsPropertiesWithType),
    $UpdateTemplateFields.merge($LetterPropertiesWithType),
  ])
);

const $TemplateDtoFields = z
  .object({
    id: z.string().trim().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .merge($UpdateTemplateFields);

export const $TemplateDtoSchema = schemaFor<TemplateDto>()(
  z.union([
    $TemplateDtoFields.merge($EmailPropertiesWithType),
    $TemplateDtoFields.merge($NhsAppPropertiesWithType),
    $TemplateDtoFields.merge($SmsPropertiesWithType),
    $TemplateDtoFields.merge($LetterPropertiesWithType),
  ])
);

export const isCreateTemplateValid = (
  input: unknown
): CreateTemplate | undefined => $CreateTemplateSchema.safeParse(input).data;

export const isUpdateTemplateValid = (
  input: unknown
): UpdateTemplate | undefined => $UpdateTemplateSchema.safeParse(input).data;

export const isTemplateDtoValid = (input: unknown): TemplateDto | undefined =>
  $TemplateDtoSchema.safeParse(input).data;
