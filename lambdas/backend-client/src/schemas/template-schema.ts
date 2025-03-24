import { z } from 'zod';
import {
  BaseTemplate,
  CreateLetterProperties,
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
} from './union-lists';

export type EmailPropertiesWithType = EmailProperties & {
  templateType: 'EMAIL';
};
export type NhsAppPropertiesWithType = NhsAppProperties & {
  templateType: 'NHS_APP';
};
export type SmsPropertiesWithType = SmsProperties & { templateType: 'SMS' };
export type LetterPropertiesWithType = LetterProperties & {
  templateType: 'LETTER';
};
export type CreateLetterPropertiesWithType = CreateLetterProperties & {
  templateType: 'LETTER';
};

export type ValidatedCreateTemplate = CreateTemplate &
  (
    | EmailPropertiesWithType
    | NhsAppPropertiesWithType
    | SmsPropertiesWithType
    | CreateLetterPropertiesWithType
  );

export type ValidatedUpdateTemplate = UpdateTemplate &
  (
    | EmailPropertiesWithType
    | NhsAppPropertiesWithType
    | SmsPropertiesWithType
    | LetterPropertiesWithType
  );
export type ValidatedTemplateDto = TemplateDto &
  (
    | EmailPropertiesWithType
    | NhsAppPropertiesWithType
    | SmsPropertiesWithType
    | LetterPropertiesWithType
  );

const $FileDetails = schemaFor<FileDetails>()(
  z.object({
    fileName: z.string().trim().min(1),
    currentVersion: z.string(),
    virusScanStatus: z.enum(VIRUS_SCAN_STATUS_LIST),
  })
);

export const $LetterFiles = schemaFor<LetterFiles>()(
  z.object({
    pdfTemplate: $FileDetails,
    testDataCsv: $FileDetails.optional(),
    proofs: z.array($FileDetails).optional(),
  })
);

const $EmailProperties = schemaFor<EmailProperties>()(
  z.object({
    subject: z.string().trim().min(1),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

const $NhsAppProperties = schemaFor<NhsAppProperties>()(
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

const $SmsProperties = schemaFor<SmsProperties>()(
  z.object({
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

const $CreateLetterProperties = schemaFor<CreateLetterProperties>()(
  z.object({
    letterType: z.enum(LETTER_TYPE_LIST),
    language: z.enum(LANGUAGE_LIST),
  })
);

const $LetterProperties = schemaFor<LetterProperties>()(
  $CreateLetterProperties.extend({ files: $LetterFiles })
);

export const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: z.string().trim().min(1),
    templateType: z.enum(TEMPLATE_TYPE_LIST),
  })
);

export const $SmsPropertiesWithType = $SmsProperties.merge(
  z.object({ templateType: z.literal('SMS') })
);
export const $NhsAppPropertiesWithType = $NhsAppProperties.merge(
  z.object({ templateType: z.literal('NHS_APP') })
);
export const $EmailPropertiesWithType = $EmailProperties.merge(
  z.object({ templateType: z.literal('EMAIL') })
);
export const $CreateLetterPropertiesWithType = $CreateLetterProperties.merge(
  z.object({ templateType: z.literal('LETTER') })
);
export const $LetterPropertiesWithType = $LetterProperties.merge(
  z.object({ templateType: z.literal('LETTER') })
);

export const $CreateNonLetterSchema = schemaFor<
  Exclude<CreateTemplate, { templateType: 'LETTER' }>,
  Exclude<ValidatedCreateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppPropertiesWithType),
    $BaseTemplateSchema.merge($EmailPropertiesWithType),
    $BaseTemplateSchema.merge($SmsPropertiesWithType),
  ])
);

export const $CreateTemplateSchema = schemaFor<
  CreateTemplate,
  ValidatedCreateTemplate
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppPropertiesWithType),
    $BaseTemplateSchema.merge($EmailPropertiesWithType),
    $BaseTemplateSchema.merge($SmsPropertiesWithType),
    $BaseTemplateSchema.merge($CreateLetterPropertiesWithType),
  ])
);

const $UpdateTemplateFields = z
  .object({
    templateStatus: z.enum(TEMPLATE_STATUS_LIST),
  })
  .merge($BaseTemplateSchema);

export const $UpdateNonLetter = schemaFor<
  Exclude<UpdateTemplate, { templateType: 'LETTER' }>,
  Exclude<ValidatedUpdateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $UpdateTemplateFields.merge($NhsAppPropertiesWithType),
    $UpdateTemplateFields.merge($EmailPropertiesWithType),
    $UpdateTemplateFields.merge($SmsPropertiesWithType),
  ])
);

export const $UpdateTemplateSchema = schemaFor<
  UpdateTemplate,
  ValidatedUpdateTemplate
>()(
  z.discriminatedUnion('templateType', [
    $UpdateTemplateFields.merge($NhsAppPropertiesWithType),
    $UpdateTemplateFields.merge($EmailPropertiesWithType),
    $UpdateTemplateFields.merge($SmsPropertiesWithType),
    $UpdateTemplateFields.merge($LetterPropertiesWithType),
  ])
);

const $TemplateDtoFields = z
  .object({
    id: z.string().trim().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .merge($UpdateTemplateFields);

export const $TemplateDtoSchema = schemaFor<
  TemplateDto,
  ValidatedTemplateDto
>()(
  z.discriminatedUnion('templateType', [
    $TemplateDtoFields.merge($NhsAppPropertiesWithType),
    $TemplateDtoFields.merge($EmailPropertiesWithType),
    $TemplateDtoFields.merge($SmsPropertiesWithType),
    $TemplateDtoFields.merge($LetterPropertiesWithType),
  ])
);

export const isCreateTemplateValid = (
  input: unknown
): ValidatedCreateTemplate | undefined =>
  $CreateTemplateSchema.safeParse(input).data;

export const isUpdateTemplateValid = (
  input: unknown
): ValidatedUpdateTemplate | undefined =>
  $UpdateTemplateSchema.safeParse(input).data;

export const isTemplateDtoValid = (
  input: unknown
): ValidatedTemplateDto | undefined => $TemplateDtoSchema.safeParse(input).data;
