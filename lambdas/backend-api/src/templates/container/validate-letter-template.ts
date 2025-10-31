import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { loadConfig } from '../infra/config';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { templateRepositoryContainer } from './templates-repository';

export const validateLetterTemplateFilesContainer = () => {
  const { quarantineBucket, internalBucket, downloadBucket } = loadConfig();

  const letterUploadRepository = new LetterUploadRepository(
    quarantineBucket,
    internalBucket,
    downloadBucket
  );

  return {
    ...templateRepositoryContainer(),
    letterUploadRepository,
    logger,
  };
};
