import { z } from 'zod';
import {
  type GuardDutyMalwareScanStatus,
  $GuardDutyMalwareScanStatus,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import { LetterUploadRepository } from '../infra/letter-upload-repository';

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type SetLetterFileVirusScanStatusLambdaInput = {
  detail: {
    s3ObjectDetails: {
      objectKey: string;
    };
    scanResultDetails: {
      scanResultStatus: GuardDutyMalwareScanStatus;
    };
  };
};

const $SetLetterFileVirusScanStatusLambdaInput: z.ZodType<SetLetterFileVirusScanStatusLambdaInput> =
  z.object({
    detail: z.object({
      s3ObjectDetails: z.object({
        objectKey: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatus,
      }),
    }),
  });

export const createHandler =
  ({ templateRepository }: { templateRepository: TemplateRepository }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey },
        scanResultDetails: { scanResultStatus },
      },
    } = $SetLetterFileVirusScanStatusLambdaInput.parse(event);

    const metadata = LetterUploadRepository.parseKey(objectKey);

    const templateKey = { owner: metadata.owner, id: metadata['template-id'] };
    const virusScanResult =
      scanResultStatus === 'NO_THREATS_FOUND' ? 'PASSED' : 'FAILED';

    await templateRepository.setLetterFileVirusScanStatus(
      templateKey,
      metadata['file-type'],
      metadata['version-id'],
      virusScanResult
    );
  };
