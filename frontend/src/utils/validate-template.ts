import { z } from 'zod';
import {
  $NHSAppTemplate,
  $SMSTemplate,
  $EmailTemplate,
  $LetterTemplate,
  $Template,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
  $SubmittedNHSAppTemplate,
  $SubmittedTemplate,
  $NonSubmittedTemplate,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDTO } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

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
  zodValidate($Template, template);

export const validateSubmittedTemplate = (template?: TemplateDTO) =>
  zodValidate($SubmittedTemplate, template);

export const validateNonSubmittedTemplate = (template?: TemplateDTO) =>
  zodValidate($NonSubmittedTemplate, template);
