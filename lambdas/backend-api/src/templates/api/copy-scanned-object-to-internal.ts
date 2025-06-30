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
    } = guardDutyEventValidator('PASSED').parse(event);

    logger.info('Copying scanned object from quarantine to internal bucket', {
      objectKey,
      versionId,
    });

    await letterFileRepository.copyFromQuarantineToInternal(
      objectKey,
      versionId
    );
  };
