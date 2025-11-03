import { SESClient } from '@aws-sdk/client-ses';
import { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { loadConfig } from '../infra/config';
import { templatesContainer } from './templates';

export const submitTemplateContainer = () => {
  const {
    templateSubmittedSenderEmailAddress,
    supplierRecipientEmailAddresses,
  } = loadConfig();

  const sesClient = new SESClient({ region: 'eu-west-2' });

  const emailClient = new EmailClient(
    sesClient,
    templateSubmittedSenderEmailAddress,
    supplierRecipientEmailAddresses,
    logger
  );

  return {
    ...templatesContainer(),
    emailClient,
  };
};
