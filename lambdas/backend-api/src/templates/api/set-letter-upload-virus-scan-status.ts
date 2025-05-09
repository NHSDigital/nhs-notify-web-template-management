import { guardDutyEventValidator } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import { LetterUploadRepository } from '../infra/letter-upload-repository';

export const createHandler =
  ({ templateRepository }: { templateRepository: TemplateRepository }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey },
        scanResultDetails: { scanResultStatus },
      },
    } = guardDutyEventValidator().parse(event);

    const metadata = LetterUploadRepository.parseKey(objectKey);

    const templateKey = { owner: metadata.owner, id: metadata['template-id'] };
    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    await templateRepository.setLetterFileVirusScanStatusForUpload(
      templateKey,
      metadata['file-type'],
      metadata['version-id'],
      virusScanResult
    );
  };
