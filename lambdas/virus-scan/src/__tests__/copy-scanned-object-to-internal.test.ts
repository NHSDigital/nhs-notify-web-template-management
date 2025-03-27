import 'aws-sdk-client-mock-jest';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { makeQuarantineScanResultEnrichedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { handler } from '../copy-scanned-object-to-internal';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';

function setup() {
  const mocks = { s3: mockClient(S3Client) };
  return { mocks };
}

beforeAll(() => {
  process.env.TEMPLATES_INTERNAL_S3_BUCKET_NAME = 'internal-bucket';
});

afterAll(() => {
  delete process.env.TEMPLATES_INTERNAL_S3_BUCKET_NAME;
});

it('copies the scanned file to the internal s3 bucket', async () => {
  const { mocks } = setup();

  const event = makeQuarantineScanResultEnrichedEvent({
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
  });

  await handler(event);

  expect(mocks.s3).toHaveReceivedCommandWith(CopyObjectCommand, {
    Bucket: 'internal-bucket',
    CopySource: '/quarantine-bucket/template.pdf?versionId=s3-version-id',
    Key: 'template.pdf',
    MetadataDirective: 'COPY',
    TaggingDirective: 'COPY',
  });
});

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
          scanResultStatus: 'NO_THREATS_FOUND',
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
          scanResultStatus: 'NO_THREATS_FOUND',
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
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(mocks.s3).not.toHaveReceivedAnyCommand();
});

it('errors if the event has no scanResultStatus', async () => {
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

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'errors if the event has object tag GuardDutyMalwareScanStatus with value %s',
  async (status) => {
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
            scanResultStatus: status,
          },
        },
      })
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(mocks.s3).not.toHaveReceivedAnyCommand();
  }
);
