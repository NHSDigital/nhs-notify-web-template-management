import { z } from 'zod';
import {
  $GuardDutyMalwareScanStatus,
  type GuardDutyMalwareScanStatus,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../infra';
import type { LetterUploadRepository } from '../infra/letter-upload-repository';

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type SetLetterFileVirusScanStatusLambdaInput = {
  detail: {
    s3ObjectDetails: {
      bucketName: string;
      objectKey: string;
      versionId: string;
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
        bucketName: z.string(),
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatus,
      }),
    }),
  });

export const createHandler =
  ({
    templateRepository,
    letterUploadRepository,
  }: {
    templateRepository: TemplateRepository;
    letterUploadRepository: LetterUploadRepository;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails,
        scanResultDetails: { scanResultStatus },
      },
    } = $SetLetterFileVirusScanStatusLambdaInput.parse(event);

    const metadata = await letterUploadRepository.getFileMetadata(
      s3ObjectDetails.bucketName,
      s3ObjectDetails.objectKey,
      s3ObjectDetails.versionId
    );

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
