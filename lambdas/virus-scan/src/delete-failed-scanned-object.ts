import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  $GuardDutyMalwareScanStatusFailed,
  type GuardDutyMalwareScanStatusFailed,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

type DeleteFailedScannedObjectLambdaInput = {
  detail: {
    s3ObjectDetails: {
      bucketName: string;
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
        bucketName: z.string(),
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatusFailed,
      }),
    }),
  });

export const handler = async (event: unknown) => {
  const {
    detail: {
      s3ObjectDetails: { bucketName, objectKey, versionId },
    },
  } = $DeleteFailedScannedObjectLambdaInput.parse(event);

  await new S3Client({}).send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      VersionId: versionId,
    })
  );
};
