import type { SQSRecord as NativeSQSRecord } from 'aws-lambda';
import {
  S3Client,
  GetObjectTaggingCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { z } from 'zod';

// Full event is S3ObjectTagsAddedNotificationEvent from aws-lambda package
// Just validating the parts we use
const S3ObjectTagsAddedNotificationEvent = z.object({
  detail: z.object({
    bucket: z.object({
      name: z.string(),
    }),
    object: z.object({
      key: z.string(),
      'version-id': z.string(),
    }),
  }),
});

export type SQSRecord = Pick<NativeSQSRecord, 'body'>;
export type S3ObjectTagsAddedNotificationEvent = z.infer<
  typeof S3ObjectTagsAddedNotificationEvent
>;
export type S3ObjectTagsAddedNotificationEventDetail =
  S3ObjectTagsAddedNotificationEvent['detail'];

// This Lambda is used by AWS Pipes to enrich S3 "Object Tags Added" EventBridge Events stored on an SQS Queue
// Pipe Enrichment does not support partial batch failure, so there's no error handling here
// I think this is okay, because the Lambda is read-only and has no side-effects
export const handler = async (records: SQSRecord[]) => {
  const s3 = new S3Client();

  return await Promise.all(
    records.map(async (record) => {
      logger.info(record);

      const s3Event = S3ObjectTagsAddedNotificationEvent.parse(
        JSON.parse(record.body)
      );

      const Bucket = s3Event.detail.bucket.name;
      const Key = s3Event.detail.object.key;
      const VersionId = s3Event.detail.object['version-id'];

      const tagsRequest = await s3.send(
        new GetObjectTaggingCommand({
          Bucket,
          Key,
          VersionId,
        })
      );

      const headRequest = await s3.send(
        new HeadObjectCommand({
          Bucket,
          Key,
          VersionId,
        })
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
        bucket: s3Event.detail.bucket,
        object: {
          ...s3Event.detail.object,
          tags,
          metadata: headResponse.Metadata || {},
        },
      };

      logger.info(result);

      return result;
    })
  );
};
