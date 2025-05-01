import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import { LetterProofRepository } from '../infra/letter-proof-repository';
import { LetterFileRepository } from '../infra/letter-file-repository';

export const createHandler =
  ({
    templateRepository,
    letterFileRepository,
  }: {
    templateRepository: TemplateRepository;
    letterFileRepository: LetterFileRepository;
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

    await letterFileRepository.copyFromQuarantineToInternal(
      objectKey,
      versionId,
      internalKey
    );

    // we will copy to the download bucket here as well

    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';
    await templateRepository.setLetterFileVirusScanStatusForProof(
      owner,
      templateId,
      fileName,
      internalKey,
      virusScanResult
    );
  };
