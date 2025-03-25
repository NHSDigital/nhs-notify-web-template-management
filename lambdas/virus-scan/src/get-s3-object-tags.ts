import type { SQSRecord } from 'aws-lambda';
import {
  S3Client,
  GetObjectTaggingCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { z } from 'zod';

// Full event is S3ObjectTagsAddedNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
type GetS3ObjectTagsLambdaInput = {
  detail: {
    bucket: { name: string };
    object: { key: string; 'version-id': string };
  };
};

type GetS3ObjectTagsLambdaResult = GetS3ObjectTagsLambdaInput['detail'] & {
  object: GetS3ObjectTagsLambdaInput['detail']['object'] & {
    tags: Record<string, string>;
    metadata: Record<string, string>;
  };
};

const $GetS3ObjectTagsLambdaInput: z.ZodType<GetS3ObjectTagsLambdaInput> =
  z.object({
    detail: z.object({
      bucket: z.object({ name: z.string() }),
      object: z.object({ key: z.string(), 'version-id': z.string() }),
    }),
  });

// This Lambda is used by AWS Pipes to enrich S3 "Object Tags Added" EventBridge Events stored on an SQS Queue
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

      const Bucket = detail.bucket.name;
      const Key = detail.object.key;
      const VersionId = detail.object['version-id'];

      const tagsRequest = await s3.send(
        new GetObjectTaggingCommand({ Bucket, Key, VersionId })
      );

      const headRequest = await s3.send(
        new HeadObjectCommand({ Bucket, Key, VersionId })
      );

      const [tagsResponse, headResponse] = await Promise.all([
        tagsRequest,
        headRequest,
      ]);

      const tags: Record<string, string> = {};

      for (const tag of tagsResponse.TagSet || []) {
        if (tag.Key && tag.Value) {
          tags[tag.Key] = tag.Value;
        }
      }

      const result = {
        ...detail,
        object: {
          ...detail.object,
          tags,
          metadata: headResponse.Metadata || {},
        },
      };

      return result;
    })
  );
};
