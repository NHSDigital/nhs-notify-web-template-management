import { z } from 'zod';
import {
  ChannelTemplate,
  CreateTemplate,
  EmailProperties,
  FileDetails,
  Language,
  LetterFiles,
  LetterProperties,
  LetterType,
  NHSAppProperties,
  SMSProperties,
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
  VirusScanStatus,
} from '../types/generated';
import {
  MAX_EMAIL_CHARACTER_LENGTH,
  MAX_NHS_APP_CHARACTER_LENGTH,
  MAX_SMS_CHARACTER_LENGTH,
  NHS_APP_DISALLOWED_CHARACTERS,
} from './constants';
import { schemaFor } from './schema-for';

const $VirusScanStatus = schemaFor<VirusScanStatus>()(
  z.nativeEnum(VirusScanStatus)
);

const $FileDetails = schemaFor<FileDetails>()(
  z.object({
    fileName: z.string().trim().min(1),
    currentVersion: z.string().optional(),
    virusScanStatus: $VirusScanStatus.optional(),
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
    templateType: z.literal('EMAIL'),
    subject: z.string().trim().min(1),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

export const $NHSAppProperties = schemaFor<NHSAppProperties>()(
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

export const $SMSProperties = schemaFor<SMSProperties>()(
  z.object({
    templateType: z.literal('SMS'),
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $LetterProperties = schemaFor<LetterProperties>()(
  z.object({
    templateType: z.literal('LETTER'),
    letterType: z.nativeEnum(LetterType),
    language: z.nativeEnum(Language),
    files: $LetterFiles,
  })
);

export const $ChannelTemplate = schemaFor<ChannelTemplate>()(
  z.discriminatedUnion('templateType', [
    $NHSAppProperties,
    $EmailProperties,
    $SMSProperties,
    $LetterProperties,
  ])
);

export const $CreateTemplateSchema = schemaFor<CreateTemplate>()(
  z.intersection(
    $ChannelTemplate,
    z.object({
      name: z.string().trim().min(1),
    })
  )
);

export const $UpdateTemplateSchema = z.intersection(
  $ChannelTemplate,
  z.object({
    name: z.string().trim().min(1),
    templateStatus: z.nativeEnum(TemplateStatus),
  })
);

export const $TemplateDTOSchema = z.intersection(
  $ChannelTemplate,
  z.object({
    id: z.string(),
    name: z.string().trim().min(1),
    templateStatus: z.nativeEnum(TemplateStatus),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);

export const isCreateTemplateValid = (
  input: unknown
): CreateTemplate | undefined => $CreateTemplateSchema.safeParse(input).data;

export const isUpdateTemplateValid = (
  input: unknown
): UpdateTemplate | undefined => $UpdateTemplateSchema.safeParse(input).data;

export const isTemplateDTOValid = (input: unknown): TemplateDTO | undefined =>
  $TemplateDTOSchema.safeParse(input).data;
