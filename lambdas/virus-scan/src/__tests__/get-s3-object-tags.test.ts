import { mockClient } from 'aws-sdk-client-mock';
import {
  GetObjectTaggingCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  makeS3ObjectTagsAddedNotificationEvent,
  makeS3ObjectTagsAddedNotificationEventDetail,
  makeSQSRecord,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { handler } from '../get-s3-object-tags';

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

test('returns enriched s3 object details', async () => {
  const event1Detail = makeS3ObjectTagsAddedNotificationEventDetail({
    bucket: { name: 's3-bucket' },
    object: { key: 'object-key-1', 'version-id': 'version-1' },
  });

  const event2Detail = makeS3ObjectTagsAddedNotificationEventDetail({
    bucket: { name: 's3-bucket' },
    object: { key: 'object-key-2', 'version-id': 'version-2' },
  });

  const records = [
    makeSQSRecord({
      body: JSON.stringify(
        makeS3ObjectTagsAddedNotificationEvent({ detail: event1Detail })
      ),
    }),
    makeSQSRecord({
      body: JSON.stringify(
        makeS3ObjectTagsAddedNotificationEvent({ detail: event2Detail })
      ),
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
    .resolves({ Metadata: { key: 'value2', key2: 'value3' } })
    .on(GetObjectTaggingCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-1',
      VersionId: 'version-1',
    })
    .resolves({ TagSet: [{ Key: 'TagKey', Value: 'TagValue1' }] })
    .on(GetObjectTaggingCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-2',
      VersionId: 'version-2',
    })
    .resolves({
      TagSet: [
        { Key: 'TagKey', Value: 'TagValue2' },
        { Key: 'AnotherTagKey', Value: 'TagValue3' },
      ],
    });

  await expect(handler(records)).resolves.toEqual([
    {
      bucket: { name: 's3-bucket' },
      object: {
        key: 'object-key-1',
        'version-id': 'version-1',
        metadata: { key: 'value1' },
        tags: { TagKey: 'TagValue1' },
      },
    },
    {
      bucket: { name: 's3-bucket' },
      object: {
        key: 'object-key-2',
        'version-id': 'version-2',
        metadata: { key: 'value2', key2: 'value3' },
        tags: { TagKey: 'TagValue2', AnotherTagKey: 'TagValue3' },
      },
    },
  ]);
});

test('handles unset tag and metadata values', async () => {
  const event1Detail = makeS3ObjectTagsAddedNotificationEventDetail({
    bucket: { name: 's3-bucket' },
    object: { key: 'object-key-1', 'version-id': 'version-1' },
  });

  const event2Detail = makeS3ObjectTagsAddedNotificationEventDetail({
    bucket: { name: 's3-bucket' },
    object: { key: 'object-key-2', 'version-id': 'version-2' },
  });

  const records = [
    makeSQSRecord({
      body: JSON.stringify(
        makeS3ObjectTagsAddedNotificationEvent({ detail: event1Detail })
      ),
    }),
    makeSQSRecord({
      body: JSON.stringify(
        makeS3ObjectTagsAddedNotificationEvent({ detail: event2Detail })
      ),
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
    .resolves({}) // No metadata
    .on(GetObjectTaggingCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-1',
      VersionId: 'version-1',
    })
    .resolves({}) // No TagSet
    .on(GetObjectTaggingCommand, {
      Bucket: 's3-bucket',
      Key: 'object-key-2',
      VersionId: 'version-2',
    })
    .resolves({
      TagSet: [
        { Key: '', Value: 'TagValue' }, // Falsy Tag Key
        { Key: 'TagKey', Value: '' }, // Falsy Tag Value
      ],
    });

  await expect(handler(records)).resolves.toEqual([
    {
      bucket: { name: 's3-bucket' },
      object: {
        key: 'object-key-1',
        'version-id': 'version-1',
        metadata: { key: 'value1' },
        tags: {},
      },
    },
    {
      bucket: { name: 's3-bucket' },
      object: {
        key: 'object-key-2',
        'version-id': 'version-2',
        metadata: {},
        tags: {},
      },
    },
  ]);
});
