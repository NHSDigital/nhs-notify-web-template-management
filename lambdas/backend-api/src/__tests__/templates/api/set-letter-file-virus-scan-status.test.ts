import { mock } from 'jest-mock-extended';
import { makeQuarantineScanResultEnrichedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';
import type { TemplateRepository } from '../../../templates/infra';
import { createHandler } from '../../..//templates/api/set-letter-file-virus-scan-status';

function setup() {
  const mocks = { templateRepository: mock<TemplateRepository>() };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it('sets the virus scan status on pdf files identified by file metadata', async () => {
  const { handler, mocks } = setup();

  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).toHaveBeenCalledWith(
    { id: 'template-id', owner: 'template-owner' },
    'pdfTemplate',
    'template-version',
    'PASSED'
  );
});

it('sets the virus scan status on csv files identified by file metadata', async () => {
  const { handler, mocks } = setup();

  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'test-data.csv',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'test-data',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).toHaveBeenCalledWith(
    { id: 'template-id', owner: 'template-owner' },
    'testDataCsv',
    'template-version',
    'PASSED'
  );
});

it.each($GuardDutyMalwareScanStatusFailed.options)(
  'handles guard duty scan failure status %s',
  async (status) => {
    const { handler, mocks } = setup();

    const event = makeQuarantineScanResultEnrichedEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: 'template.pdf',
          metadata: {
            owner: 'template-owner',
            'template-id': 'template-id',
            'version-id': 'template-version',
            'file-type': 'pdf-template',
          },
        },
        scanResultDetails: { scanResultStatus: status },
      },
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterFileVirusScanStatus
    ).toHaveBeenCalledWith(
      { id: 'template-id', owner: 'template-owner' },
      'pdfTemplate',
      'template-version',
      'FAILED'
    );
  }
);

it('errors if event object metadata has no owner', async () => {
  const { handler, mocks } = setup();
  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object metadata has no template-id', async () => {
  const { handler, mocks } = setup();
  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'version-id': 'template-version',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object metadata has no version-id', async () => {
  const { handler, mocks } = setup();
  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object metadata has no file-type', async () => {
  const { handler, mocks } = setup();
  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object metadata has invalid file-type', async () => {
  const { handler, mocks } = setup();
  const event = makeQuarantineScanResultEnrichedEvent({
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'unknown-file-type',
        },
      },
      scanResultDetails: { scanResultStatus: 'NO_THREATS_FOUND' },
    },
  });

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object has no scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: {},
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});

it('errors if event object has invalid scan result status', async () => {
  const { handler, mocks } = setup();
  const event = {
    detail: {
      s3ObjectDetails: {
        bucketName: 'quarantine-bucket',
        objectKey: 'template.pdf',
        metadata: {
          owner: 'template-owner',
          'template-id': 'template-id',
          'version-id': 'template-version',
          'file-type': 'pdf-template',
        },
      },
      scanResultDetails: { scanResultStatus: 'UNKNOWN_STATUS' },
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.templateRepository.setLetterFileVirusScanStatus
  ).not.toHaveBeenCalled();
});
