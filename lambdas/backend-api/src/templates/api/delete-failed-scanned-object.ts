import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { LetterFileRepository } from '../infra/letter-file-repository';

export const createHandler =
  ({ letterFileRepository }: { letterFileRepository: LetterFileRepository }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey, versionId },
      },
    } = guardDutyEventValidator('FAILED').parse(event);

    await letterFileRepository.deleteFromQuarantine(objectKey, versionId);
  };
