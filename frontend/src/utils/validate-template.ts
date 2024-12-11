import { z } from 'zod';
import {
  NHSAppTemplate,
  EmailTemplate,
  SMSTemplate,
  ChannelTemplate,
  Template,
  logger,
  $NHSAppTemplate,
  $SMSTemplate,
  $EmailTemplate,
  $ChannelTemplate,
} from 'nhs-notify-web-template-management-utils';

export const validateNHSAppTemplate = (
  template: Template | undefined
): NHSAppTemplate | undefined => {
  try {
    return $NHSAppTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateSMSTemplate = (
  template: Template | undefined
): SMSTemplate | undefined => {
  try {
    return $SMSTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateEmailTemplate = (
  template: Template | undefined
): EmailTemplate | undefined => {
  try {
    return $EmailTemplate.parse(template);
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const validateChannelTemplate = (
  template: Template | undefined
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
