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
      owner,
    } = LetterUploadRepository.parseKey(objectKey);

    const templateKey = { owner, id: templateId };
    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    logger.info('Setting virus scan status', {
      templateId: templateKey,
      virusScanResult,
      fileType,
      versionId,
      owner,
    });

    await templateRepository.setLetterFileVirusScanStatusForUpload(
      templateKey,
      fileType,
      versionId,
      virusScanResult
    );
  };
