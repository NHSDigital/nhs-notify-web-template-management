import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  $GuardDutyMalwareScanStatusPassed,
  type GuardDutyMalwareScanStatusPassed,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

type CopyScannedObjectToInternalLambdaInput = {
  detail: {
    s3ObjectDetails: {
      bucketName: string;
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
        bucketName: z.string(),
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $GuardDutyMalwareScanStatusPassed,
      }),
    }),
  });

export const handler = async (event: unknown) => {
  const {
    detail: {
      s3ObjectDetails: { bucketName, objectKey, versionId },
    },
  } = $CopyScannedObjectToInternalLambdaInput.parse(event);

  await new S3Client({}).send(
    new CopyObjectCommand({
      CopySource: `/${bucketName}/${objectKey}?versionId=${versionId}`,
      Bucket: process.env.TEMPLATES_INTERNAL_S3_BUCKET_NAME,
      Key: objectKey,
      MetadataDirective: 'COPY',
      TaggingDirective: 'COPY',
    })
  );
};
