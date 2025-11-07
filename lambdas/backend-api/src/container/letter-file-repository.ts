import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { loadConfig } from '../infra/config';
import { LetterFileRepository } from '../infra/letter-file-repository';

export const letterFileRepositoryContainer = () => {
  const { quarantineBucket, internalBucket, downloadBucket } = loadConfig();

  const letterFileRepository = new LetterFileRepository(
    quarantineBucket,
    internalBucket,
    downloadBucket
  );

  return {
    letterFileRepository,
    logger,
  };
};
