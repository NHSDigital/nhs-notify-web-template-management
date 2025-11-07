import { mock } from 'jest-mock-extended';
import { makeGuardDutyMalwareScanResultNotificationEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../../infra';
import { createHandler } from '../../api/set-letter-upload-virus-scan-status';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

function setup() {
  const mocks = {
    templateRepository: mock<TemplateRepository>(),
    logger: createMockLogger().logger,
  };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it('sets the virus scan status on pdf uploads identified by file metadata', async () => {
  const { handler, mocks } = setup();

  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey:
          'pdf-template/template-owner/template-id/template-version.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatusForUpload
  ).toHaveBeenCalledWith(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    'pdf-template',
    'template-version',
    'PASSED'
  );
});

it('sets the virus scan status on csv files identified by file metadata', async () => {
  const { handler, mocks } = setup();

  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'test-data/template-owner/template-id/template-version.csv',
        versionId: 'test-data-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatusForUpload
  ).toHaveBeenCalledWith(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    'test-data',
    'template-version',
    'PASSED'
  );
});

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'handles guard duty scan failure status %s',
  async (status) => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey:
            'pdf-template/template-owner/template-id/template-version.pdf',
          versionId: 'pdf-s3-version-id',
        },
        scanResultDetails: { scanResultStatus: status },
      },
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterFileVirusScanStatusForUpload
    ).toHaveBeenCalledWith(
      {
        templateId: 'template-id',
        clientId: 'template-owner',
      },
      'pdf-template',
      'template-version',
      'FAILED'
    );
  }
);

it('errors if event has no object key name', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatusForUpload
  ).not.toHaveBeenCalled();
});

it('errors if event has no scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey:
          'pdf-template/template-owner/template-id/template-version.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: {},
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatusForUpload
  ).not.toHaveBeenCalled();
});

it('errors if event has invalid scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey:
          'pdf-template/template-owner/template-id/template-version.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'UNKNOWN_STATUS' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatusForUpload
  ).not.toHaveBeenCalled();
});

it('errors if status update fails', async () => {
  const { handler, mocks } = setup();
  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey:
          'pdf-template/template-owner/template-id/template-version.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  const error = new Error('Status Update error');

  mocks.templateRepository.setLetterFileVirusScanStatusForUpload.mockRejectedValueOnce(
    error
  );

  await expect(handler(event)).rejects.toThrow(error);
});
