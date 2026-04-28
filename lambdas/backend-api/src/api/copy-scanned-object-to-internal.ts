import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { LetterFileRepository } from '../infra/letter-file-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

function stripEnvironmentFromObjectKey(objectKey: string, environment: string) {
  const [env, ...rest] = objectKey.split('/');

  if (env === environment) {
    return rest.join('/');
  }

  return objectKey;
}

export const createHandler =
  ({
    letterFileRepository,
    logger,
    environment,
  }: {
    letterFileRepository: LetterFileRepository;
    logger: Logger;
    environment: string;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey, versionId },
      },
    } = guardDutyEventValidator('PASSED').parse(event);

    const destinationKey = stripEnvironmentFromObjectKey(
      objectKey,
      environment
    );

    logger.info('Copying scanned object from quarantine to internal bucket', {
      objectKey,
      versionId,
      destinationKey,
    });

    await letterFileRepository.copyFromQuarantineToInternal(
      objectKey,
      versionId,
      destinationKey
    );
  };
