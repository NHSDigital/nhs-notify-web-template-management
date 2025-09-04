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

    const { templateId, fileName, supplier } =
      LetterProofRepository.parseQuarantineKey(objectKey);

    const clientId = await templateRepository.getClientId(templateId);

    const internalKey = LetterProofRepository.getInternalKey(
      clientId,
      templateId,
      fileName
    );
    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    if (virusScanResult === 'PASSED') {
      const downloadKey = LetterProofRepository.getDownloadKey(
        clientId,
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

    await templateRepository.setLetterFileVirusScanStatusForProof(
      { clientId, templateId },
      fileName,
      virusScanResult,
      supplier
    );
  };
