import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { LetterFileRepository } from '../infra/letter-file-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

export const createHandler =
  ({
    letterFileRepository,
    logger,
  }: {
    letterFileRepository: LetterFileRepository;
    logger: Logger;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey, versionId },
      },
    } = guardDutyEventValidator('FAILED').parse(event);

    logger.info('Deleting object from quarantine bucket', {
      objectKey,
      versionId,
    });

    await letterFileRepository.deleteFromQuarantine(objectKey, versionId);
  };
