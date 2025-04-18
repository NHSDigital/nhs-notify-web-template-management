import { z } from 'zod';
import {
  BaseTemplate,
  CreateUpdateLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
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
export type CreateUpdateLetterPropertiesWithType =
  CreateUpdateLetterProperties & {
    templateType: 'LETTER';
  };

export type ValidatedCreateUpdateTemplate = CreateUpdateTemplate &
  (
    | EmailPropertiesWithType
    | NhsAppPropertiesWithType
    | SmsPropertiesWithType
    | CreateUpdateLetterPropertiesWithType
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

const $CreateUpdateLetterProperties = schemaFor<CreateUpdateLetterProperties>()(
  z.object({
    letterType: z.enum(LETTER_TYPE_LIST),
    language: z.enum(LANGUAGE_LIST),
  })
);

const $LetterProperties = schemaFor<LetterProperties>()(
  $CreateUpdateLetterProperties.extend({ files: $LetterFiles })
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
export const $CreateUpdateLetterPropertiesWithType =
  $CreateUpdateLetterProperties.merge(
    z.object({ templateType: z.literal('LETTER') })
  );
export const $LetterPropertiesWithType = $LetterProperties.merge(
  z.object({ templateType: z.literal('LETTER') })
);

export const $CreateUpdateNonLetter = schemaFor<
  Exclude<CreateUpdateTemplate, { templateType: 'LETTER' }>,
  Exclude<ValidatedCreateUpdateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppPropertiesWithType),
    $BaseTemplateSchema.merge($EmailPropertiesWithType),
    $BaseTemplateSchema.merge($SmsPropertiesWithType),
  ])
);

export const $CreateUpdateTemplate = schemaFor<
  CreateUpdateTemplate,
  ValidatedCreateUpdateTemplate
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.merge($NhsAppPropertiesWithType),
    $BaseTemplateSchema.merge($EmailPropertiesWithType),
    $BaseTemplateSchema.merge($SmsPropertiesWithType),
    $BaseTemplateSchema.merge($CreateUpdateLetterPropertiesWithType),
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
    $TemplateDtoFields.merge($NhsAppPropertiesWithType),
    $TemplateDtoFields.merge($EmailPropertiesWithType),
    $TemplateDtoFields.merge($SmsPropertiesWithType),
    $TemplateDtoFields.merge($LetterPropertiesWithType),
  ])
);

export const isCreateUpdateTemplateValid = (
  input: unknown
): ValidatedCreateUpdateTemplate | undefined =>
  $CreateUpdateTemplate.safeParse(input).data;

export const isTemplateDtoValid = (
  input: unknown
): ValidatedTemplateDto | undefined => $TemplateDtoSchema.safeParse(input).data;
