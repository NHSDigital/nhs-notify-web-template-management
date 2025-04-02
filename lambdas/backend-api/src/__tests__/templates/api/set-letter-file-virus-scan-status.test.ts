import { mock } from 'jest-mock-extended';
import { makeGuardDutyMalwareScanResultNotificationEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';
import type {
  TemplateRepository,
  LetterUploadRepository,
} from '../../../templates/infra';
import { createHandler } from '../../../templates/api/set-letter-file-virus-scan-status';

function setup() {
  const mocks = {
    templateRepository: mock<TemplateRepository>(),
    letterUploadRepository: mock<LetterUploadRepository>(),
  };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it('sets the virus scan status on pdf files identified by file metadata', async () => {
  const { handler, mocks } = setup();

  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  mocks.letterUploadRepository.getFileMetadata.mockResolvedValueOnce({
    owner: 'template-owner',
    'template-id': 'template-id',
    'user-filename': 'template.pdf',
    'version-id': 'template-version',
    'file-type': 'pdf-template',
  });

  await handler(event);

  expect(mocks.letterUploadRepository.getFileMetadata).toHaveBeenCalledWith(
    'quarantine-bucket',
    'template.pdf',
    'pdf-s3-version-id'
  );

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).toHaveBeenCalledWith(
    { id: 'template-id', owner: 'template-owner' },
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
        objectKey: 'test-data.csv',
        versionId: 'test-data-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  mocks.letterUploadRepository.getFileMetadata.mockResolvedValue({
    owner: 'template-owner',
    'template-id': 'template-id',
    'version-id': 'template-version',
    'file-type': 'test-data',
    'user-filename': 'template.pdf',
  });

  await handler(event);

  expect(mocks.letterUploadRepository.getFileMetadata).toHaveBeenCalledWith(
    'quarantine-bucket',
    'test-data.csv',
    'test-data-s3-version-id'
  );

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).toHaveBeenCalledWith(
    { id: 'template-id', owner: 'template-owner' },
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
          objectKey: 'template.pdf',
          versionId: 'pdf-s3-version-id',
        },
        scanResultDetails: { scanResultStatus: status },
      },
    });

    mocks.letterUploadRepository.getFileMetadata.mockResolvedValueOnce({
      owner: 'template-owner',
      'template-id': 'template-id',
      'version-id': 'template-version',
      'file-type': 'pdf-template',
      'user-filename': 'template.pdf',
    });

    await handler(event);

    expect(mocks.letterUploadRepository.getFileMetadata).toHaveBeenCalledWith(
      'quarantine-bucket',
      'template.pdf',
      'pdf-s3-version-id'
    );

    expect(
      mocks.templateRepository.setLetterFileVirusScanStatus
    ).toHaveBeenCalledWith(
      { id: 'template-id', owner: 'template-owner' },
      'pdf-template',
      'template-version',
      'FAILED'
    );
  }
);

it('errors if event has no bucket name', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREAT_FOUND' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event has no object key name', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREAT_FOUND' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event has no object version id', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREAT_FOUND' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event has no scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: {},
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event has invalid scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'UNKNOWN_STATUS' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object metadata cannot be fetched', async () => {
  const { handler, mocks } = setup();
  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  const error = new Error('GetFileMetadata error');
  mocks.letterUploadRepository.getFileMetadata.mockRejectedValueOnce(error);

  await expect(handler(event)).rejects.toThrow(error);

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if status update fails', async () => {
  const { handler, mocks } = setup();
  const event = makeGuardDutyMalwareScanResultNotificationEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        versionId: 'pdf-s3-version-id',
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  mocks.letterUploadRepository.getFileMetadata.mockResolvedValueOnce({
    owner: 'template-owner',
    'template-id': 'template-id',
    'version-id': 'template-version',
    'file-type': 'pdf-template',
    'user-filename': 'template.pdf',
  });

  const error = new Error('Status Update error');

  mocks.templateRepository.setLetterFileVirusScanStatus.mockRejectedValueOnce(
    error
  );

  await expect(handler(event)).rejects.toThrow(error);
});
