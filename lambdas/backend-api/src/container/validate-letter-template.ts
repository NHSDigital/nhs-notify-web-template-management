import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { loadConfig } from '../infra/config';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { templateRepositoryContainer } from './templates-repository';

export const validateLetterTemplateFilesContainer = () => {
  const { quarantineBucket, internalBucket, downloadBucket, environment } =
    loadConfig();

  const letterUploadRepository = new LetterUploadRepository(
    quarantineBucket,
    internalBucket,
    downloadBucket,
    environment
  );

  return {
    ...templateRepositoryContainer(),
    letterUploadRepository,
    logger,
  };
};
