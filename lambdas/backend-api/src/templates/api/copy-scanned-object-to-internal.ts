import { z } from 'zod';
import {
  $GuardDutyMalwareScanStatusPassed,
  type GuardDutyMalwareScanStatusPassed,
} from 'nhs-notify-web-template-management-utils';
import type { LetterUploadRepository } from '../infra/letter-upload-repository';

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type CopyScannedObjectToInternalLambdaInput = {
  detail: {
    s3ObjectDetails: {
      objectKey: string;
      versionId: string;
    };
    scanResultDetails: {
      scanResultStatus: GuardDutyMalwareScanStatusPassed;
    };
  };
};
const $CopyScannedObjectToInternalLambdaInput: z.ZodType<CopyScannedObjectToInternalLambdaInput> =
  z.object({
    detail: z.object({
      s3ObjectDetails: z.object({
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatusPassed,
      }),
    }),
  });

export const createHandler =
  ({
    letterUploadRepository,
  }: {
    letterUploadRepository: LetterUploadRepository;
  }) =>
  async (event: unknown) => {
    const {
      detail: {
        s3ObjectDetails: { objectKey, versionId },
      },
    } = $CopyScannedObjectToInternalLambdaInput.parse(event);

    await letterUploadRepository.copyFromQuarantineToInternal(
      objectKey,
      versionId
    );
  };
