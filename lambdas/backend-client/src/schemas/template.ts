import { z } from 'zod/v4';
import {
  AuthoringLetterProperties,
  BaseTemplate,
  CreatePdfProofingLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
  VersionedFileDetails,
  ProofFileDetails,
  LetterFiles,
  LetterProperties,
  PdfProofingLetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
  LetterType,
  Language,
  BaseCreatedTemplate,
  TemplateStatus,
  TemplateStatusActive,
  TemplateType,
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
import { TemplateFilter } from '../types/filters';

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

export const $CreatePdfProofingLetterProperties =
  schemaFor<CreatePdfProofingLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      campaignId: z.string(),
    })
  );

export const $PdfProofingLetterProperties =
  schemaFor<PdfProofingLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      files: $LetterFiles,
      letterVersion: z.literal('PDF_PROOFING'),
      personalisationParameters: z.array(z.string()).optional(),
      proofingEnabled: z.boolean().optional(),
      supplierReferences: z.record(z.string(), z.string()).optional(),
    })
  );

export const $AuthoringLetterProperties =
  schemaFor<AuthoringLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      letterVariantId: z.string(),
      letterVersion: z.literal('AUTHORING'),
      sidesCount: z.number().int(),
    })
  );

// Default letterVersion to PDF_PROOFING for existing letters in the database
// that were created before letterVersion was introduced
const addDefaultLetterVersion = (val: unknown) => {
  if (
    typeof val === 'object' &&
    val !== null &&
    'templateType' in val &&
    val.templateType === 'LETTER' &&
    !('letterVersion' in val)
  ) {
    return { ...val, letterVersion: 'PDF_PROOFING' };
  }
  return val;
};

export const $LetterProperties: z.ZodType<LetterProperties> = z.preprocess(
  addDefaultLetterVersion,
  z.discriminatedUnion('letterVersion', [
    $PdfProofingLetterProperties,
    $AuthoringLetterProperties,
  ])
);

export const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: z.string().trim().min(1),
    templateType: z.enum(TEMPLATE_TYPE_LIST),
  })
);

export const $CreateUpdateNonLetter = schemaFor<
  Exclude<CreateUpdateTemplate, { templateType: 'LETTER' }>
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.extend($NhsAppProperties.shape),
    $BaseTemplateSchema.extend($EmailProperties.shape),
    $BaseTemplateSchema.extend($SmsProperties.shape),
  ])
);

export const $CreateUpdateTemplate = schemaFor<CreateUpdateTemplate>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.extend($NhsAppProperties.shape),
    $BaseTemplateSchema.extend($EmailProperties.shape),
    $BaseTemplateSchema.extend($SmsProperties.shape),
    $BaseTemplateSchema.extend($CreatePdfProofingLetterProperties.shape),
  ])
);

export const $LockNumber = z.coerce
  .string()
  .trim()
  .min(1) // min string length is 1
  .transform(Number)
  .pipe(z.number().int().min(0)); // min integer value is 0

const $TemplateStatus = schemaFor<TemplateStatus>()(
  z.enum(TEMPLATE_STATUS_LIST)
);

const $TemplateStatusActive = schemaFor<TemplateStatusActive>()(
  $TemplateStatus.exclude(['DELETED'])
);

const $TemplateType = schemaFor<TemplateType>()(z.enum(TEMPLATE_TYPE_LIST));

const $TemplateStatusFilter = schemaFor<
  TemplateStatusActive[],
  TemplateStatusActive | TemplateStatusActive[]
>()(
  z
    .union([z.array($TemplateStatusActive), $TemplateStatusActive])
    .transform((value) => (Array.isArray(value) ? value : [value]))
);

const $BaseTemplateDto = schemaFor<
  BaseCreatedTemplate,
  Omit<BaseCreatedTemplate, 'lockNumber'>
>()(
  z.object({
    ...$BaseTemplateSchema.shape,
    campaignId: z.string().optional(),
    clientId: z.string().optional(),
    createdAt: z.string(),
    lockNumber: $LockNumber.default(0),
    id: z.string().trim().min(1),
    templateStatus: $TemplateStatus,
    updatedAt: z.string(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  })
);

export const $TemplateDto: z.ZodType<TemplateDto> = z.preprocess(
  addDefaultLetterVersion,
  z.union([
    z.discriminatedUnion('templateType', [
      $BaseTemplateDto.extend($NhsAppProperties.shape),
      $BaseTemplateDto.extend($EmailProperties.shape),
      $BaseTemplateDto.extend($SmsProperties.shape),
    ]),
    z.discriminatedUnion('letterVersion', [
      $BaseTemplateDto.extend($PdfProofingLetterProperties.shape),
      $BaseTemplateDto.extend($AuthoringLetterProperties.shape),
    ]),
  ])
);

export const $TemplateFilter = z.object({
  templateStatus: $TemplateStatusFilter.optional(),
  templateType: $TemplateType.optional(),
  language: $Language.optional(),
  excludeLanguage: $Language.optional(),
  letterType: $LetterType.optional(),
}) satisfies z.ZodType<TemplateFilter>;
