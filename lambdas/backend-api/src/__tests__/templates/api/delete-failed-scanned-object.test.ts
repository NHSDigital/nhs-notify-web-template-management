import { mock } from 'jest-mock-extended';
import { makeGuardDutyMalwareScanResultNotificationEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { LetterUploadRepository } from '../../../templates/infra';
import { createHandler } from '../../../templates/api/delete-failed-scanned-object';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';

function setup() {
  const mocks = { letterUploadRepository: mock<LetterUploadRepository>() };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'deletes the file with scan status %s',
  async (status) => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine',
          objectKey: 'some/object/key',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: status,
        },
      },
    });

    await handler(event);

    expect(
      mocks.letterUploadRepository.deleteFromQuarantine
    ).toHaveBeenCalledWith('some/object/key', 's3-version-id');
  }
);

it('errors if the event has no s3 object key', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: 'THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no s3 version id', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine',
          objectKey: 'some/object/key',
        },
        scanResultDetails: {
          scanResultStatus: 'THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no virus scan status', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine',
          objectKey: 'some/object/key',
          versionId: 's3-version-id',
        },
        scanResultDetails: {},
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has virus scan status NO_THREATS_FOUND', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine',
          objectKey: 'some/object/key',
          versionId: 's3-version-id',
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});
