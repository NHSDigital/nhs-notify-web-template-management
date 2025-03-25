import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  $GuardDutyMalwareScanStatusPassed,
  type GuardDutyMalwareScanStatusPassed,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

type CopyScannedObjectToInternalLambdaInput = {
  detail: {
    bucket: { name: string };
    object: {
      key: string;
      'version-id': string;
      tags: { GuardDutyMalwareScanStatus: GuardDutyMalwareScanStatusPassed };
    };
  };
};

const $CopyScannedObjectToInternalLambdaInput: z.ZodType<CopyScannedObjectToInternalLambdaInput> =
  z.object({
    detail: z.object({
      bucket: z.object({ name: z.string() }),
      object: z.object({
        key: z.string(),
        'version-id': z.string(),
        tags: z.object({
          GuardDutyMalwareScanStatus: $GuardDutyMalwareScanStatusPassed,
        }),
      }),
    }),
  });

export const handler = async (event: unknown) => {
  const { detail } = $CopyScannedObjectToInternalLambdaInput.parse(event);

  await new S3Client({}).send(
    new CopyObjectCommand({
      CopySource: `/${detail.bucket.name}/${detail.object.key}?versionId=${detail.object['version-id']}`,
      Bucket: process.env.TEMPLATES_INTERNAL_S3_BUCKET_NAME,
      Key: detail.object.key,
      MetadataDirective: 'COPY',
      TaggingDirective: 'COPY',
    })
  );
};
