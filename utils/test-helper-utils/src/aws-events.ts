import { createHash, randomUUID } from 'node:crypto';
import type {
  EventBridgeEvent,
  GuardDutyScanResultNotificationEvent,
  GuardDutyScanResultNotificationEventDetail,
  SQSRecord,
} from 'aws-lambda';

// SQS Record
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

// EventBridge Event Base
type MakeEventBridgeEventParams<
  TDetailType extends string,
  TDetail,
  TSource extends string = string,
> = Partial<EventBridgeEvent<TDetailType, TDetail>> &
  Pick<EventBridgeEvent<TDetailType, TDetail>, 'detail-type' | 'detail'> & {
    source: TSource;
  };

const makeEventBridgeEvent = <
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

// GuardDuty Malware Scan Result Event
type MakeGuardDutyMalwareScanResultNotificationEventDetailParams = Partial<
  Omit<
    GuardDutyScanResultNotificationEventDetail,
    's3ObjectDetails' | 'scanResultDetails'
  >
> & {
  s3ObjectDetails: Partial<
    GuardDutyScanResultNotificationEventDetail['s3ObjectDetails']
  > &
    Pick<
      GuardDutyScanResultNotificationEventDetail['s3ObjectDetails'],
      'objectKey' | 'bucketName'
    >;
} & Partial<{
    scanResultDetails: Partial<
      GuardDutyScanResultNotificationEventDetail['scanResultDetails']
    >;
  }>;

export const makeGuardDutyMalwareScanResultNotificationEventDetail = (
  detail: MakeGuardDutyMalwareScanResultNotificationEventDetailParams
): GuardDutyScanResultNotificationEventDetail => ({
  schemaVersion: '1.0',
  scanStatus: 'COMPLETED',
  resourceType: 'S3_OBJECT',
  ...detail,
  s3ObjectDetails: {
    eTag: randomUUID(),
    s3Throttled: false,
    versionId: randomUUID(),
    ...detail.s3ObjectDetails,
  },
  scanResultDetails: {
    scanResultStatus: 'NO_THREATS_FOUND',
    threats: null,
    ...detail.scanResultDetails,
  },
});

type MakeGuardDutyMalwareScanResultNotificationEventParams = Omit<
  MakeEventBridgeEventParams<
    'GuardDuty Malware Protection Object Scan Result',
    GuardDutyScanResultNotificationEventDetail,
    'aws.guardduty'
  >,
  'detail-type' | 'source' | 'detail'
> & { detail: MakeGuardDutyMalwareScanResultNotificationEventDetailParams };

export const makeGuardDutyMalwareScanResultNotificationEvent = (
  event: MakeGuardDutyMalwareScanResultNotificationEventParams
): GuardDutyScanResultNotificationEvent =>
  makeEventBridgeEvent({
    ...event,
    source: 'aws.guardduty',
    'detail-type': 'GuardDuty Malware Protection Object Scan Result',
    detail: makeGuardDutyMalwareScanResultNotificationEventDetail(event.detail),
  });
