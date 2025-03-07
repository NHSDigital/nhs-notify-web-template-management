import { z } from 'zod';
import {
  $CreateTemplateSchema,
  $EmailProperties,
  $LetterProperties,
  $NHSAppProperties,
  $SMSProperties,
  $TemplateDTOSchema,
  TemplateDTO,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import { logger } from './logger';

export const zodValidate = <T extends z.Schema>(
  schema: T,
  obj: unknown
): z.infer<T> | undefined => {
  try {
    return schema.parse(obj);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const $SubmittedTemplate = z.intersection(
  $TemplateDTOSchema,
  z.object({
    templateStatus: z.literal('SUBMITTED'),
  })
);

export const $NonSubmittedTemplate = z.intersection(
  $TemplateDTOSchema,
  z.object({
    templateStatus: z.literal('NOT_YET_SUBMITTED'),
  })
);

export const $CreateNHSAppTemplate = z.intersection(
  $CreateTemplateSchema,
  $NHSAppProperties
);
export const $NHSAppTemplate = z.intersection(
  $TemplateDTOSchema,
  $NHSAppProperties
);
export const $SubmittedNHSAppTemplate = z.intersection(
  $SubmittedTemplate,
  $NHSAppTemplate
);

export const $CreateEmailTemplate = z.intersection(
  $CreateTemplateSchema,
  $EmailProperties
);
export const $EmailTemplate = z.intersection(
  $TemplateDTOSchema,
  $EmailProperties
);
export const $SubmittedEmailTemplate = z.intersection(
  $SubmittedTemplate,
  $EmailTemplate
);

export const $CreateSMSTemplate = z.intersection(
  $CreateTemplateSchema,
  $SMSProperties
);
export const $SMSTemplate = z.intersection($TemplateDTOSchema, $SMSProperties);
export const $SubmittedSMSTemplate = z.intersection(
  $SubmittedTemplate,
  $SMSTemplate
);

export const $CreateLetterTemplate = z.intersection(
  $CreateTemplateSchema,
  $LetterProperties
);
export const $LetterTemplate = z.intersection(
  $TemplateDTOSchema,
  $LetterProperties
);
export const $SubmittedLetterTemplate = z.intersection(
  $SubmittedTemplate,
  $LetterTemplate
);

export const validateNHSAppTemplate = (template?: TemplateDTO) =>
  zodValidate($NHSAppTemplate, template);

export const validateSMSTemplate = (template?: TemplateDTO) =>
  zodValidate($SMSTemplate, template);

export const validateEmailTemplate = (template?: TemplateDTO) =>
  zodValidate($EmailTemplate, template);

export const validateLetterTemplate = (template?: TemplateDTO) =>
  zodValidate($LetterTemplate, template);

export const validateSubmittedEmailTemplate = (template?: TemplateDTO) =>
  zodValidate($SubmittedEmailTemplate, template);

export const validateSubmittedSMSTemplate = (template?: TemplateDTO) =>
  zodValidate($SubmittedSMSTemplate, template);

export const validateSubmittedNHSAppTemplate = (template?: TemplateDTO) =>
  zodValidate($SubmittedNHSAppTemplate, template);

export const validateTemplate = (template?: TemplateDTO) =>
  zodValidate($TemplateDTOSchema, template);

export const validateNonSubmittedTemplate = (template?: TemplateDTO) =>
  zodValidate($NonSubmittedTemplate, template);
