import { z } from 'zod';

export const templateStatuses = [
  'DELETED',
  'NOT_YET_SUBMITTED',
  'PENDING_PROOF_REQUEST',
  'PENDING_UPLOAD',
  'PENDING_VALIDATION',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'VALIDATION_FAILED',
  'VIRUS_SCAN_FAILED',
  'WAITING_FOR_PROOF',
];

const languages = [
  'ar',
  'bg',
  'bn',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fr',
  'gu',
  'hi',
  'hu',
  'it',
  'ku',
  'lt',
  'lv',
  'ne',
  'pa',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'so',
  'sq',
  'ta',
  'tr',
  'ur',
  'zh',
];

const letterTypes = ['q4', 'x0', 'x1'];

const $BaseTemplateDataFields = z.object({
  owner: z.string(),
  id: z.string(),
  clientId: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string().optional(),
  name: z.string(),
  templateStatus: z.enum(templateStatuses),
  updatedAt: z.string(),
  updatedBy: z.string().optional(),
});

// fields by template type
const $EmailDataFields = $BaseTemplateDataFields.extend({
  message: z.string(),
  subject: z.string(),
  templateType: z.literal('EMAIL'),
});
const $NhsAppDataFields = $BaseTemplateDataFields.extend({
  message: z.string(),
  templateType: z.literal('NHS_APP'),
});
const $LetterDataFields = $BaseTemplateDataFields.extend({
  files: z.object({
    proofs: z
      .record(
        z.string(),
        z.object({
          supplier: z.string(),
        })
      )
      .optional(),
  }),
  templateType: z.literal('LETTER'),
  language: z.enum(languages),
  letterType: z.enum(letterTypes),
  personalisationParameters: z.array(z.string()).optional(),
});
const $SmsDataFields = $BaseTemplateDataFields.extend({
  message: z.string(),
  templateType: z.literal('SMS'),
});

export const $TemplateSavedDataFields = z.discriminatedUnion('templateType', [
  $EmailDataFields,
  $NhsAppDataFields,
  $LetterDataFields,
  $SmsDataFields,
]);
