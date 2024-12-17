import { z } from 'zod';
import {
  NHSAppTemplate,
  EmailTemplate,
  SMSTemplate,
  ChannelTemplate,
  Template,
  SubmittedEmailTemplate,
  SubmittedSMSTemplate,
  SubmittedNHSAppTemplate,
  $NHSAppTemplate,
  $SMSTemplate,
  $EmailTemplate,
  $ChannelTemplate,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
  $SubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDTO } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

type TemplateUnion = Template | TemplateDTO | undefined;

export const validateNHSAppTemplate = (
  template: TemplateUnion
): NHSAppTemplate | undefined => {
  try {
    return $NHSAppTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateSMSTemplate = (
  template: TemplateUnion
): SMSTemplate | undefined => {
  try {
    return $SMSTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateEmailTemplate = (
  template: TemplateUnion
): EmailTemplate | undefined => {
  try {
    return $EmailTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateSubmittedEmailTemplate = (
  template: Template | undefined
): SubmittedEmailTemplate | undefined => {
  try {
    return $SubmittedEmailTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateSubmittedSMSTemplate = (
  template: Template | undefined
): SubmittedSMSTemplate | undefined => {
  try {
    return $SubmittedSMSTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateSubmittedNHSAppTemplate = (
  template: Template | undefined
): SubmittedNHSAppTemplate | undefined => {
  try {
    return $SubmittedNHSAppTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateChannelTemplate = (
  template: TemplateUnion
): ChannelTemplate | undefined => {
  try {
    return $ChannelTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const zodValidate = <T extends z.AnyZodObject>(
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
