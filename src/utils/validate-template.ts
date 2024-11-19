import {
  NHSAppTemplate,
  EmailTemplate,
  SMSTemplate,
  ChannelTemplate,
  Template,
} from '@utils/types';
import { logger } from '@utils/logger';
import {
  $NHSAppTemplate,
  $SMSTemplate,
  $EmailTemplate,
  $ChannelTemplate,
} from './zod-validators';

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
