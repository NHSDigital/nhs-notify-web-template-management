import { mockClient } from 'aws-sdk-client-mock';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  makeGuardDutyMalwareScanResultNotificationEvent,
  makeGuardDutyMalwareScanResultNotificationEventDetail,
  makeSQSRecord,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { handler } from '../enrich-guardduty-scan-result';

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

test('returns enriched s3 object details', async () => {
  const event1 = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: makeGuardDutyMalwareScanResultNotificationEventDetail({
      s3ObjectDetails: {
        bucketName: 's3-bucket',
        objectKey: 'object-key-1',
        versionId: 'version-1',
      },
    }),
  });

  const event2 = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: makeGuardDutyMalwareScanResultNotificationEventDetail({
      s3ObjectDetails: {
        bucketName: 's3-bucket',
        objectKey: 'object-key-2',
        versionId: 'version-2',
      },
    }),
  });

  const records = [
    makeSQSRecord({
      body: JSON.stringify(event1),
    }),
    makeSQSRecord({
      body: JSON.stringify(event2),
    }),
  ];

  s3Mock
    .on(HeadObjectCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-1',
      VersionId: 'version-1',
    })
    .resolves({ Metadata: { key: 'value1' } })
    .on(HeadObjectCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-2',
      VersionId: 'version-2',
    })
    .resolves({ Metadata: { key: 'value2', key2: 'value3' } });

  await expect(handler(records)).resolves.toEqual([
    {
      ...event1.detail,
      s3ObjectDetails: {
        ...event1.detail.s3ObjectDetails,
        metadata: { key: 'value1' },
      },
    },
    {
      ...event2.detail,
      s3ObjectDetails: {
        ...event2.detail.s3ObjectDetails,
        metadata: { key: 'value2', key2: 'value3' },
      },
    },
  ]);
});

test('handles unset metadata values', async () => {
  const event1 = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: makeGuardDutyMalwareScanResultNotificationEventDetail({
      s3ObjectDetails: {
        bucketName: 's3-bucket',
        objectKey: 'object-key-1',
        versionId: 'version-1',
      },
    }),
  });

  const event2 = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: makeGuardDutyMalwareScanResultNotificationEventDetail({
      s3ObjectDetails: {
        bucketName: 's3-bucket',
        objectKey: 'object-key-2',
        versionId: 'version-2',
      },
    }),
  });

  const records = [
    makeSQSRecord({
      body: JSON.stringify(event1),
    }),
    makeSQSRecord({
      body: JSON.stringify(event2),
    }),
  ];

  s3Mock
    .on(HeadObjectCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-1',
      VersionId: 'version-1',
    })
    .resolves({ Metadata: { key: 'value1' } })
    .on(HeadObjectCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-2',
      VersionId: 'version-2',
    })
    .resolves({}); // No metadata

  await expect(handler(records)).resolves.toEqual([
    {
      ...event1.detail,
      s3ObjectDetails: {
        ...event1.detail.s3ObjectDetails,
        metadata: { key: 'value1' },
      },
    },
    {
      ...event2.detail,
      s3ObjectDetails: {
        ...event2.detail.s3ObjectDetails,
        metadata: {},
      },
    },
  ]);
});
