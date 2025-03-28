import type { SQSRecord } from 'aws-lambda';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type GetS3ObjectTagsLambdaInput = {
  detail: {
    s3ObjectDetails: {
      bucketName: string;
      objectKey: string;
      versionId: string;
    };
  };
};

type GetS3ObjectTagsLambdaResult = GetS3ObjectTagsLambdaInput['detail'] & {
  s3ObjectDetails: GetS3ObjectTagsLambdaInput['detail']['s3ObjectDetails'] & {
    metadata: Record<string, string>;
  };
};

const $GetS3ObjectTagsLambdaInput: z.ZodType<GetS3ObjectTagsLambdaInput> = z
  .object({
    detail: z
      .object({
        s3ObjectDetails: z
          .object({
            bucketName: z.string(),
            objectKey: z.string(),
            versionId: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

// This Lambda is used by AWS Pipes to enrich GuardDuty "GuardDuty Malware Protection Object Scan Result" EventBridge Events stored on an SQS Queue
// Pipe Enrichment does not support partial batch failure, so there's no error handling here
// I think this is okay, because the Lambda is read-only and has no side-effects
export const handler = async (
  records: SQSRecord[]
): Promise<GetS3ObjectTagsLambdaResult[]> => {
  const s3 = new S3Client({});

  return await Promise.all(
    records.map(async (record) => {
      const { detail } = $GetS3ObjectTagsLambdaInput.parse(
        JSON.parse(record.body)
      );

      const Bucket = detail.s3ObjectDetails.bucketName;
      const Key = detail.s3ObjectDetails.objectKey;
      const VersionId = detail.s3ObjectDetails.versionId;

      const response = await s3.send(
        new HeadObjectCommand({ Bucket, Key, VersionId })
      );

      const result: GetS3ObjectTagsLambdaResult = {
        ...detail,
        s3ObjectDetails: {
          ...detail.s3ObjectDetails,
          metadata: response.Metadata || {},
        },
      };

      return result;
    })
  );
};
