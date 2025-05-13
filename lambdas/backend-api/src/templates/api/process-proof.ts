import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import { LetterProofRepository } from '../infra/letter-proof-repository';
import { LetterFileRepository } from '../infra/letter-file-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';

export const createHandler =
  ({
    templateRepository,
    letterFileRepository,
    logger,
  }: {
    templateRepository: TemplateRepository;
    letterFileRepository: LetterFileRepository;
    logger: Logger;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey, versionId },
        scanResultDetails: { scanResultStatus },
      },
    } = guardDutyEventValidator().parse(event);

    const { templateId, fileName } =
      LetterProofRepository.parseQuarantineKey(objectKey);

    const owner = await templateRepository.getOwner(templateId);

    const internalKey = LetterProofRepository.getInternalKey(
      owner,
      templateId,
      fileName
    );
    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    if (virusScanResult === 'PASSED') {
      const downloadKey = LetterProofRepository.getDownloadKey(
        owner,
        templateId,
        fileName
      );

      await Promise.all([
        letterFileRepository.copyFromQuarantineToInternal(
          objectKey,
          versionId,
          internalKey
        ),
        letterFileRepository.copyFromQuarantineToDownload(
          objectKey,
          versionId,
          downloadKey
        ),
      ]);
    } else {
      logger.error({
        description: 'File found that did not pass virus scan',
        objectKey,
      });
    }

    // we will copy to the download bucket here as well

    await templateRepository.setLetterFileVirusScanStatusForProof(
      owner,
      templateId,
      fileName,
      internalKey,
      virusScanResult
    );
  };
