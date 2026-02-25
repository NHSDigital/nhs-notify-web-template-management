import { z } from 'zod/v4';
import {
  type AuthoringLetterFiles,
  type PatchTemplate,
  type AuthoringLetterProperties,
  type BaseCreatedTemplate,
  type BaseTemplate,
  type CreateAuthoringLetterProperties,
  type CreatePdfLetterProperties,
  type CreateUpdateTemplate,
  type EmailProperties,
  type Language,
  type LetterType,
  type LetterValidationError,
  type NhsAppProperties,
  type PersonalisedRenderDetails,
  type PdfLetterFiles,
  type PdfLetterProperties,
  type ProofFileDetails,
  type RenderDetails,
  type RenderStatus,
  type SmsProperties,
  type TemplateDto,
  type TemplateStatus,
  type TemplateStatusActive,
  type TemplateType,
  type VersionedFileDetails,
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
  LETTER_VALIDATION_ERROR_LIST,
  RENDER_STATUS_LIST,
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

export const $PdfLetterFiles = schemaFor<PdfLetterFiles>()(
  z.object({
    pdfTemplate: $VersionedFileDetails,
    testDataCsv: $VersionedFileDetails.optional(),
    proofs: z.record(z.string(), $ProofFileDetails).optional(),
  })
);

const $RenderStatus = schemaFor<RenderStatus>()(z.enum(RENDER_STATUS_LIST));

const $RenderDetails = schemaFor<RenderDetails>()(
  z.object({
    currentVersion: z.string(),
    fileName: z.string().trim().min(1),
    pageCount: z.number().int(),
    status: $RenderStatus,
  })
);

const $PersonalisedRenderDetails = schemaFor<PersonalisedRenderDetails>()(
  z.object({
    currentVersion: z.string(),
    fileName: z.string().trim().min(1),
    pageCount: z.number().int(),
    personalisationParameters: z.record(z.string(), z.string()),
    systemPersonalisationPackId: z.string(),
    status: $RenderStatus,
  })
);

export const $AuthoringLetterFiles = schemaFor<AuthoringLetterFiles>()(
  z.object({
    docxTemplate: $VersionedFileDetails,
    initialRender: $RenderDetails.optional(),
    longFormRender: $PersonalisedRenderDetails.optional(),
    shortFormRender: $PersonalisedRenderDetails.optional(),
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

const $BaseLetterTemplateProperties = z.object({
  templateType: z.literal('LETTER'),
  letterType: z.enum(LETTER_TYPE_LIST),
  language: z.enum(LANGUAGE_LIST),
});

export const $CreatePdfLetterProperties =
  schemaFor<CreatePdfLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      campaignId: z.string(),
      letterVersion: z.literal('PDF'),
    })
  );

export const $PdfLetterProperties = schemaFor<PdfLetterProperties>()(
  z.object({
    ...$BaseLetterTemplateProperties.shape,
    files: $PdfLetterFiles,
    letterVersion: z.literal('PDF'),
    personalisationParameters: z.array(z.string()).optional(),
    proofingEnabled: z.boolean().optional(),
    supplierReferences: z.record(z.string(), z.string()).optional(),
  })
);

const $LetterValidationError = schemaFor<LetterValidationError>()(
  z.enum(LETTER_VALIDATION_ERROR_LIST)
);

export const $CreateAuthoringLetterProperties =
  schemaFor<CreateAuthoringLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      campaignId: z.string(),
      letterVersion: z.literal('AUTHORING'),
    })
  );

export const $AuthoringLetterProperties =
  schemaFor<AuthoringLetterProperties>()(
    z.object({
      ...$BaseLetterTemplateProperties.shape,
      customPersonalisation: z.array(z.string()).optional(),
      files: $AuthoringLetterFiles,
      letterVariantId: z.string().optional(),
      letterVersion: z.literal('AUTHORING'),
      systemPersonalisation: z.array(z.string()).optional(),
      validationErrors: z.array($LetterValidationError).optional(),
    })
  );

const $LetterVersionWithDefault = z
  .union([z.undefined(), z.literal('PDF')])
  .transform((val) => val ?? ('PDF' as const));

const $PdfLetterPropertiesWithDefaultVersion = z.object({
  ...$PdfLetterProperties.shape,
  letterVersion: $LetterVersionWithDefault,
});

export const $LetterProperties = z.discriminatedUnion('letterVersion', [
  $PdfLetterPropertiesWithDefaultVersion,
  $AuthoringLetterProperties,
]);

const $TemplateName = z.string().trim().min(1);

const $BaseTemplateSchema = schemaFor<BaseTemplate>()(
  z.object({
    name: $TemplateName,
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

export const $CreateUpdateLetterTemplate = z.discriminatedUnion(
  'letterVersion',
  [
    $BaseTemplateSchema.extend($CreatePdfLetterProperties.shape),
    $BaseTemplateSchema.extend($CreateAuthoringLetterProperties.shape),
  ]
);

export const $CreateUpdateTemplate = schemaFor<CreateUpdateTemplate>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateSchema.extend($NhsAppProperties.shape),
    $BaseTemplateSchema.extend($EmailProperties.shape),
    $BaseTemplateSchema.extend($SmsProperties.shape),
    $CreateUpdateLetterTemplate,
  ])
);

export const $PatchTemplate = schemaFor<PatchTemplate>()(
  z
    .object({
      campaignId: z.string().trim().nonempty().optional(),
      name: $TemplateName.optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { error: 'Unexpected empty object' }
    )
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

const $AuthoringLetterTemplateDto = $BaseTemplateDto.extend(
  $AuthoringLetterProperties.shape
);

const $PdfLetterTemplateDto = $BaseTemplateDto.extend({
  ...$PdfLetterProperties.shape,
  letterVersion: $LetterVersionWithDefault,
});

const $LetterTemplateDto = z.discriminatedUnion('letterVersion', [
  $PdfLetterTemplateDto,
  $AuthoringLetterTemplateDto,
]);

export const $TemplateDto = schemaFor<
  TemplateDto,
  Omit<BaseCreatedTemplate, 'lockNumber'> & {
    lockNumber?: unknown;
  } & (
      | SmsProperties
      | EmailProperties
      | NhsAppProperties
      | AuthoringLetterProperties
      | (Omit<PdfLetterProperties, 'letterVersion'> & { letterVersion?: 'PDF' })
    )
>()(
  z.discriminatedUnion('templateType', [
    $BaseTemplateDto.extend($NhsAppProperties.shape),
    $BaseTemplateDto.extend($EmailProperties.shape),
    $BaseTemplateDto.extend($SmsProperties.shape),
    $LetterTemplateDto,
  ])
);

export const $TemplateFilter = z.object({
  templateStatus: $TemplateStatusFilter.optional(),
  templateType: $TemplateType.optional(),
  language: $Language.optional(),
  excludeLanguage: $Language.optional(),
  letterType: $LetterType.optional(),
}) satisfies z.ZodType<TemplateFilter>;
