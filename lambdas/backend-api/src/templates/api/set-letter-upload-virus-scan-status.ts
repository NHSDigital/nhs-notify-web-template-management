import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

export const createHandler =
  ({
    templateRepository,
    logger,
  }: {
    templateRepository: TemplateRepository;
    logger: Logger;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey },
        scanResultDetails: { scanResultStatus },
      },
    } = guardDutyEventValidator().parse(event);

    const {
      'file-type': fileType,
      'version-id': versionId,
      'template-id': templateId,
      'user-or-client-id': userOrClientId,
    } = LetterUploadRepository.parseKey(objectKey);

    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    const { owner: ownerFromDatabase, clientOwned } =
      await templateRepository.getOwner(templateId);

    if (ownerFromDatabase !== owner) {
      throw new Error('Database owner and s3 owner mismatch');
    }

    logger.info('Setting virus scan status', {
      fileType,
      owner: ownerFromDatabase,
      scanResultStatus,
      templateId,
      versionId,
      virusScanResult,
    });

    await templateRepository.setLetterFileVirusScanStatusForUpload(
      { owner: ownerFromDatabase, id: templateId, clientOwned },
      fileType,
      versionId,
      virusScanResult
    );
  };
