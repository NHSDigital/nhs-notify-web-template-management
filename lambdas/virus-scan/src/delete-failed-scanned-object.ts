import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  $GuardDutyMalwareScanStatusFailed,
  type GuardDutyMalwareScanStatusFailed,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

type DeleteFailedScannedObjectLambdaInput = {
  detail: {
    bucket: { name: string };
    object: {
      key: string;
      'version-id': string;
      tags: { GuardDutyMalwareScanStatus: GuardDutyMalwareScanStatusFailed };
    };
  };
};

const $DeleteFailedScannedObjectLambdaInput: z.ZodType<DeleteFailedScannedObjectLambdaInput> =
  z.object({
    detail: z.object({
      bucket: z.object({ name: z.string() }),
      object: z.object({
        key: z.string(),
        'version-id': z.string(),
        tags: z.object({
          GuardDutyMalwareScanStatus: $GuardDutyMalwareScanStatusFailed,
        }),
      }),
    }),
  });

export const handler = async (event: unknown) => {
  const { detail } = $DeleteFailedScannedObjectLambdaInput.parse(event);

  await new S3Client({}).send(
    new DeleteObjectCommand({
      Bucket: detail.bucket.name,
      Key: detail.object.key,
      VersionId: detail.object['version-id'],
    })
  );
};
