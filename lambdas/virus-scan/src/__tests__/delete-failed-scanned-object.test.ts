import 'aws-sdk-client-mock-jest';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { makeQuarantineScanResultEnrichedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
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

    const event = makeQuarantineScanResultEnrichedEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: 'template.pdf',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: status,
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
        s3ObjectDetails: {
          objectKey: 'template.pdf',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: 'THREATS_FOUND',
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
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: 'THREATS_FOUND',
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
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: 'template.pdf',
        },
        scanResultDetails: {
          scanResultStatus: 'THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no scan result status', async () => {
  const { mocks } = setup();

  await expect(
    handler({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: 'template.pdf',
          versionId: 's3-version-id',
        },
        scanResultDetails: {},
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
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: 'template.pdf',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});
