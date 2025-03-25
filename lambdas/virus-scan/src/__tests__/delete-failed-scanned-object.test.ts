import 'aws-sdk-client-mock-jest';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { makeObjectTagsEnrichedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { handler } from '../delete-failed-scanned-object';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';

function setup() {
  const mocks = { s3: mockClient(S3Client) };
  return { mocks };
}

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'deletes the file with scan status %s from s3',
  async (status) => {
    const { mocks } = setup();

    const event = makeObjectTagsEnrichedEvent({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: {
          key: 'template.pdf',
          'version-id': 's3-version-id',
          tags: { GuardDutyMalwareScanStatus: status },
        },
      },
    });

    await handler(event);

    expect(mocks.s3).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: 'quarantine-bucket',
      Key: 'template.pdf',
      VersionId: 's3-version-id',
    });
  }
);

it('errors if the event has no bucket name', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: {},
        object: {
          key: 'template.pdf',
          'version-id': 's3-version-id',
          tags: { GuardDutyMalwareScanStatus: 'THREATS_FOUND' },
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no object key', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: {
          'version-id': 's3-version-id',
          tags: { GuardDutyMalwareScanStatus: 'THREATS_FOUND' },
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no object version-id', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: {
          key: 'template.pdf',
          tags: { GuardDutyMalwareScanStatus: 'THREATS_FOUND' },
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no object tags', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: { key: 'template.pdf', 'version-id': 's3-version-id' },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no GuardDutyMalwareScanStatus object tag', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: {
          key: 'template.pdf',
          'version-id': 's3-version-id',
          tags: {},
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has GuardDutyMalwareScanStatus object tag with value NO_THREATS_FOUND', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        bucket: { name: 'quarantine-bucket' },
        object: {
          key: 'template.pdf',
          'version-id': 's3-version-id',
          tags: { GuardDutyMalwareScanStatus: 'NO_THREATS_FOUND' },
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});
