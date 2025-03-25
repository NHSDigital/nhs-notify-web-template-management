import { createHash, randomUUID } from 'node:crypto';
import type {
  EventBridgeEvent,
  S3ObjectTagsAddedNotificationEvent,
  S3ObjectTagsAddedNotificationEventDetail,
  SQSRecord,
} from 'aws-lambda';

type MakeSQSRecordParams = Partial<SQSRecord> & Pick<SQSRecord, 'body'>;

export const makeSQSRecord = (record: MakeSQSRecordParams): SQSRecord => {
  return {
    messageId: randomUUID(),
    receiptHandle: randomUUID(),
    attributes: {
      ApproximateReceiveCount: '0',
      SentTimestamp: new Date().toISOString(),
      SenderId: randomUUID(),
      ApproximateFirstReceiveTimestamp: new Date().toISOString(),
    },
    messageAttributes: {},
    md5OfBody: createHash('md5').update(record.body).digest('hex'), // eslint-disable-line sonarjs/hashing
    eventSource: 'aws:sqs',
    awsRegion: 'eu-west-2',
    eventSourceARN: 'arn:aws:sqs:eu-west-2:123456789012:test-queue',
    ...record,
  };
};

type MakeEventBridgeEventParams<
  TDetailType extends string,
  TDetail,
  TSource extends string = string,
> = Partial<EventBridgeEvent<TDetailType, TDetail>> &
  Pick<EventBridgeEvent<TDetailType, TDetail>, 'detail-type' | 'detail'> & {
    source: TSource;
  };

export const makeEventBridgeEvent = <
  TDetailType extends string,
  TDetail,
  TSource extends string,
>(
  event: MakeEventBridgeEventParams<TDetailType, TDetail, TSource>
): EventBridgeEvent<TDetailType, TDetail> & { source: TSource } => ({
  version: '0',
  id: randomUUID(),
  account: '123456789012',
  time: new Date().toISOString(),
  region: 'eu-west-2',
  resources: [],
  ...event,
});

type MakeS3ObjectTagsAddedNotificationEventParams = Omit<
  MakeEventBridgeEventParams<
    'Object Tags Added',
    S3ObjectTagsAddedNotificationEventDetail,
    'aws.s3'
  >,
  'detail-type' | 'source'
>;

export const makeS3ObjectTagsAddedNotificationEvent = (
  event: MakeS3ObjectTagsAddedNotificationEventParams
): S3ObjectTagsAddedNotificationEvent =>
  makeEventBridgeEvent({
    ...event,
    source: 'aws.s3',
    'detail-type': 'Object Tags Added',
  });

type MakeS3ObjectTagsAddedNotificationEventDetailParams = Partial<
  Omit<S3ObjectTagsAddedNotificationEventDetail, 'object'>
> &
  Pick<S3ObjectTagsAddedNotificationEventDetail, 'bucket'> & {
    object: Partial<S3ObjectTagsAddedNotificationEventDetail['object']> &
      Pick<S3ObjectTagsAddedNotificationEventDetail['object'], 'key'>;
  };

export const makeS3ObjectTagsAddedNotificationEventDetail = (
  detail: MakeS3ObjectTagsAddedNotificationEventDetailParams
): S3ObjectTagsAddedNotificationEventDetail => ({
  version: '0',
  'request-id': randomUUID(),
  requester: randomUUID(),
  'source-ip-address': '0.0.0.0',
  ...detail,
  object: { etag: randomUUID(), 'version-id': randomUUID(), ...detail.object },
});

type ObjectTagsEnrichedEventDetail =
  S3ObjectTagsAddedNotificationEventDetail & {
    object: S3ObjectTagsAddedNotificationEventDetail['object'] & {
      tags: Record<string, string>;
      metadata: Record<string, string>;
    };
  };

type MakeObjectTagsEnrichedEventDetailInput = Partial<
  Omit<ObjectTagsEnrichedEventDetail, 'object'>
> &
  Pick<ObjectTagsEnrichedEventDetail, 'bucket'> & {
    object: Partial<ObjectTagsEnrichedEventDetail['object']> &
      Pick<ObjectTagsEnrichedEventDetail['object'], 'key'>;
  };

type MakeObjectTagsEnrichedEventParams = Omit<
  MakeEventBridgeEventParams<
    'object-tags-enriched',
    ObjectTagsEnrichedEventDetail
  >,
  'detail-type' | 'source' | 'detail'
> & { detail: MakeObjectTagsEnrichedEventDetailInput };

export const makeObjectTagsEnrichedEvent = (
  event: MakeObjectTagsEnrichedEventParams
): EventBridgeEvent<'object-tags-enriched', ObjectTagsEnrichedEventDetail> =>
  makeEventBridgeEvent({
    ...event,
    'detail-type': 'object-tags-enriched',
    source: 'templates.test.nhs-notify',
    detail: {
      version: '0',
      'request-id': randomUUID(),
      requester: randomUUID(),
      'source-ip-address': '0.0.0.0',
      ...event.detail,
      object: {
        etag: randomUUID(),
        'version-id': randomUUID(),
        tags: {},
        metadata: {},
        ...event.detail.object,
      },
    },
  });
