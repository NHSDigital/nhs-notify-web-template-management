import type { LetterFileRepository } from '../../infra/letter-file-repository';
import { makeGuardDutyMalwareScanResultNotificationEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/copy-scanned-object-to-internal';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

function setup() {
  const mocks = {
    letterFileRepository: mock<LetterFileRepository>(),
    logger: createMockLogger().logger,
  };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it('copies the scanned file to the internal s3 bucket', async () => {
  const { handler, mocks } = setup();

  const event = makeGuardDutyMalwareScanResultNotificationEvent({
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

  expect(
    mocks.letterFileRepository.copyFromQuarantineToInternal
  ).toHaveBeenCalledWith('template.pdf', 's3-version-id');
});

it('errors if the event has no object key', async () => {
  const { handler, mocks } = setup();

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

  expect(
    mocks.letterFileRepository.copyFromQuarantineToInternal
  ).not.toHaveBeenCalled();
});

it('errors if the event has no version id', async () => {
  const { handler, mocks } = setup();

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

  expect(
    mocks.letterFileRepository.copyFromQuarantineToInternal
  ).not.toHaveBeenCalled();
});

it('errors if the event has no virus scan status', async () => {
  const { handler, mocks } = setup();

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

  expect(
    mocks.letterFileRepository.copyFromQuarantineToInternal
  ).not.toHaveBeenCalled();
});

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'errors if the event has virus scan status %s',
  async (status) => {
    const { handler, mocks } = setup();

    await expect(
      handler(
        makeGuardDutyMalwareScanResultNotificationEvent({
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
      )
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(
      mocks.letterFileRepository.copyFromQuarantineToInternal
    ).not.toHaveBeenCalled();
  }
);
