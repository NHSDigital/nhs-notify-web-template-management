import { z } from 'zod';
import {
  type GuardDutyMalwareScanStatusFailed,
  $GuardDutyMalwareScanStatusFailed,
} from 'nhs-notify-web-template-management-utils';
import type { LetterUploadRepository } from '../infra';

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type DeleteFailedScannedObjectLambdaInput = {
  detail: {
    s3ObjectDetails: {
      objectKey: string;
      versionId: string;
    };
    scanResultDetails: {
      scanResultStatus: GuardDutyMalwareScanStatusFailed;
    };
  };
};
const $DeleteFailedScannedObjectLambdaInput: z.ZodType<DeleteFailedScannedObjectLambdaInput> =
  z.object({
    detail: z.object({
      s3ObjectDetails: z.object({
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatusFailed,
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
    } = $DeleteFailedScannedObjectLambdaInput.parse(event);

    await letterUploadRepository.deleteFromQuarantine(objectKey, versionId);
  };
