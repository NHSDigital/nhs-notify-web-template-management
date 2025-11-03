import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { templateRepositoryContainer } from './templates-repository';
import { letterFileRepositoryContainer } from './letter-file-repository';

export const letterFileRepositoryAndTemplateRepositoryContainer = () => ({
  ...templateRepositoryContainer(),
  ...letterFileRepositoryContainer(),
  logger,
});
