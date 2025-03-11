import { z } from 'zod';
import {
  $CreateTemplateSchema,
  $EmailPropertiesWithType,
  $LetterFiles,
  $LetterPropertiesWithType,
  $NhsAppPropertiesWithType,
  $SmsPropertiesWithType,
  $TemplateDtoSchema,
  TemplateDto,
} from 'nhs-notify-backend-client';

export const zodValidate = <T extends z.Schema>(
  schema: T,
  obj: unknown
): z.infer<T> | undefined => {
  try {
    return schema.parse(obj);
  } catch {
    return undefined;
  }
};

export const $SubmittedTemplate = z.intersection(
  $TemplateDtoSchema,
  z.object({
    templateStatus: z.literal('SUBMITTED'),
  })
);

export const $NonSubmittedTemplate = z.intersection(
  $TemplateDtoSchema,
  z.object({
    templateStatus: z.literal('NOT_YET_SUBMITTED'),
  })
);

export const $CreateNHSAppTemplate = z.intersection(
  $CreateTemplateSchema,
  $NhsAppPropertiesWithType
);
export const $NHSAppTemplate = z.intersection(
  $TemplateDtoSchema,
  $NhsAppPropertiesWithType
);
export const $SubmittedNHSAppTemplate = z.intersection(
  $SubmittedTemplate,
  $NHSAppTemplate
);

export const $CreateEmailTemplate = z.intersection(
  $CreateTemplateSchema,
  $EmailPropertiesWithType
);
export const $EmailTemplate = z.intersection(
  $TemplateDtoSchema,
  $EmailPropertiesWithType
);
export const $SubmittedEmailTemplate = z.intersection(
  $SubmittedTemplate,
  $EmailTemplate
);

export const $CreateSMSTemplate = z.intersection(
  $CreateTemplateSchema,
  $SmsPropertiesWithType
);
export const $SMSTemplate = z.intersection(
  $TemplateDtoSchema,
  $SmsPropertiesWithType
);
export const $SubmittedSMSTemplate = z.intersection(
  $SubmittedTemplate,
  $SMSTemplate
);

export const $CreateLetterTemplate = z.intersection(
  $CreateTemplateSchema,
  $LetterPropertiesWithType
);
export const $LetterTemplate = z.intersection(
  $TemplateDtoSchema,
  $LetterPropertiesWithType.extend({ files: $LetterFiles })
);
export const $SubmittedLetterTemplate = z.intersection(
  $SubmittedTemplate,
  $LetterTemplate
);

export const validateNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($NHSAppTemplate, template);

export const validateSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SMSTemplate, template);

export const validateEmailTemplate = (template?: TemplateDto) =>
  zodValidate($EmailTemplate, template);

export const validateLetterTemplate = (template?: TemplateDto) =>
  zodValidate($LetterTemplate, template);

export const validateSubmittedEmailTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedEmailTemplate, template);

export const validateSubmittedSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedSMSTemplate, template);

export const validateSubmittedNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedNHSAppTemplate, template);

export const validateTemplate = (template?: TemplateDto) =>
  zodValidate($TemplateDtoSchema, template);

export const validateNonSubmittedTemplate = (template?: TemplateDto) =>
  zodValidate($NonSubmittedTemplate, template);
