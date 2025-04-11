import { mock } from 'jest-mock-extended';
import { ErrorCase } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  makeGuardDutyMalwareScanResultNotificationEvent,
  makeSQSRecord,
} from 'nhs-notify-web-template-management-test-helper-utils';
import type {
  TemplateRepository,
  LetterUploadRepository,
  DatabaseTemplate,
} from '@backend-api/templates/infra';
import { TemplatePdf } from '@backend-api/templates/domain/template-pdf';
import { TestDataCsv } from '@backend-api/templates/domain/test-data-csv';
import { validateLetterTemplateFiles } from '@backend-api/templates/domain/validate-letter-template-files';
import { ValidateLetterTemplateFilesLambda } from '@backend-api/templates/api/validate-letter-template-files';
import { $GuardDutyMalwareScanStatusFailed } from 'nhs-notify-web-template-management-utils';

jest.mock('@backend-api/templates/domain/template-pdf');
jest.mock('@backend-api/templates/domain/test-data-csv');
jest.mock('@backend-api/templates/domain/validate-letter-template-files');
jest.mock('nhs-notify-web-template-management-utils/logger');
jest.mocked(logger).child.mockReturnThis();

const versionId = 'template-version-id';
const templateId = 'template-id';
const owner = 'template-owner';

function setup() {
  const mocks = {
    letterUploadRepository: mock<LetterUploadRepository>(),
    templateRepository: mock<TemplateRepository>(),
    TemplatePdf: jest.mocked(TemplatePdf),
    TestDataCsv: jest.mocked(TestDataCsv),
    validateLetterTemplateFiles: jest.mocked(validateLetterTemplateFiles),
  };

  const handler = new ValidateLetterTemplateFilesLambda(mocks).guardDutyHandler;

  return { handler, mocks };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('guard duty handler', () => {
  test('loads the template data and associated files (pdf and csv), validates the file contents and saves the result to the database', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    const pdfData = Uint8Array.from('pdf');
    const csvData = Uint8Array.from('csv');

    mocks.letterUploadRepository.download
      .mockResolvedValueOnce(pdfData)
      .mockResolvedValueOnce(csvData);

    const pdf = mock<TemplatePdf>({
      personalisationParameters: ['firstName', 'parameter_1'],
    });
    mocks.TemplatePdf.mockImplementation(() => pdf);

    const csv = mock<TestDataCsv>({ parameters: ['parameter_1'] });
    mocks.TestDataCsv.mockImplementation(() => csv);

    mocks.validateLetterTemplateFiles.mockReturnValueOnce(true);

    await handler(event);

    expect(mocks.templateRepository.get).toHaveBeenCalledWith(
      templateId,
      owner
    );

    expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
      { id: templateId, owner },
      'pdf-template',
      versionId
    );

    expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
      { id: templateId, owner },
      'test-data',
      versionId
    );

    expect(mocks.TemplatePdf).toHaveBeenCalledWith(pdfData);
    expect(mocks.TestDataCsv).toHaveBeenCalledWith(csvData);

    expect(pdf.parse).toHaveBeenCalled();
    expect(csv.parse).toHaveBeenCalled();

    expect(mocks.validateLetterTemplateFiles).toHaveBeenCalledWith(pdf, csv);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).toHaveBeenCalledWith(
      { id: templateId, owner },
      versionId,
      true,
      pdf.personalisationParameters,
      csv.parameters
    );
  });

  test('loads the template data and associated files (pdf only), validates the file contents and saves the result to the database', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: undefined,
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    const pdfData = Uint8Array.from('pdf');

    mocks.letterUploadRepository.download.mockResolvedValueOnce(pdfData);

    const pdf = mock<TemplatePdf>({
      personalisationParameters: ['firstName', 'parameter_1'],
    });
    mocks.TemplatePdf.mockImplementation(() => pdf);

    mocks.validateLetterTemplateFiles.mockReturnValueOnce(true);

    await handler(event);

    expect(mocks.templateRepository.get).toHaveBeenCalledWith(
      templateId,
      owner
    );

    expect(mocks.letterUploadRepository.download).toHaveBeenCalledTimes(1);
    expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
      { id: templateId, owner },
      'pdf-template',
      versionId
    );

    expect(mocks.TemplatePdf).toHaveBeenCalledWith(pdfData);
    expect(mocks.TestDataCsv).not.toHaveBeenCalled();

    expect(pdf.parse).toHaveBeenCalled();

    expect(mocks.validateLetterTemplateFiles).toHaveBeenCalledWith(
      pdf,
      undefined
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).toHaveBeenCalledWith(
      { id: templateId, owner },
      versionId,
      true,
      pdf.personalisationParameters,
      []
    );
  });

  test('errors if the event is missing object key', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {},
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test('errors if the event is missing scan result', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {},
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test.each($GuardDutyMalwareScanStatusFailed.options)(
    'errors if the event scan result is %s',
    async (status) => {
      const { handler } = setup();
      const event = {
        detail: {
          s3ObjectDetails: {
            objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
          },
          scanResultDetails: {
            scanResultStatus: status,
          },
        },
      };

      await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
    }
  );

  test('errors if the event is missing template id', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `pdf-template/${owner}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test('errors if the event is missing template owner', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `pdf-template/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test('errors if the event is missing file-type', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test('errors if the event has unknown file-type', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `unknown/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test('errors if cannot parse version id in the event', async () => {
    const { handler } = setup();
    const event = {
      detail: {
        s3ObjectDetails: {
          objectKey: `pdf-template/${owner}/${templateId}/unexpected-file-name`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    };

    await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
  });

  test("errors if the template data can't be loaded", async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      error: {
        code: ErrorCase.TEMPLATE_NOT_FOUND,
        actualError: new Error('database error'),
        message: 'Some error message',
      },
    });

    await expect(handler(event)).rejects.toThrow(
      'Unable to load template data'
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the template has no files associated', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: undefined,
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the event version id is non-current against the pdf', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: 'newer-version-id',
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the event version id is non-current against the csv', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: 'newer-version-id',
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the template has already passed validation', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'NOT_YET_SUBMITTED',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the template has already failed validation', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'VALIDATION_FAILED',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the pdf has failed virus scan', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'FAILED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('no-op if the csv has failed virus scan', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'FAILED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('error if the pdf virus scan status is still PENDING', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PENDING',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await expect(handler(event)).rejects.toThrow(
      'Not all files have been scanned'
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('error if the csv virus scan status is still PENDING', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PENDING',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    await expect(handler(event)).rejects.toThrow(
      'Not all files have been scanned'
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test("errors if the pdf can't be downloaded", async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    mocks.letterUploadRepository.download
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(Uint8Array.from('csv'));

    await expect(handler(event)).rejects.toThrow(
      'Not all files are available to download'
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test("errors if the csv can't be downloaded", async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    mocks.letterUploadRepository.download.mockResolvedValueOnce(
      Uint8Array.from('pdf')
    );

    await expect(handler(event)).rejects.toThrow(
      'Not all files are available to download'
    );

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).not.toHaveBeenCalled();
  });

  test('sets the template to failed if unable to parse the pdf file', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    mocks.letterUploadRepository.download
      .mockResolvedValueOnce(Uint8Array.from('pdf'))
      .mockResolvedValueOnce(Uint8Array.from('csv'));

    mocks.TemplatePdf.mockImplementation(() =>
      mock<TemplatePdf>({
        parse: jest.fn().mockRejectedValue(new Error('pdf parsing error')),
      })
    );

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).toHaveBeenCalledWith({ id: templateId, owner }, versionId, false, [], []);
  });

  test('sets the template to failed if unable to parse the csv file', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    mocks.letterUploadRepository.download
      .mockResolvedValueOnce(Uint8Array.from('pdf'))
      .mockResolvedValueOnce(Uint8Array.from('csv'));

    mocks.TemplatePdf.mockImplementation(() => mock<TemplatePdf>());

    mocks.TestDataCsv.mockImplementation(() =>
      mock<TestDataCsv>({
        parse: jest.fn().mockImplementation(() => {
          throw new Error('pdf parsing error');
        }),
      })
    );

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).toHaveBeenCalledWith({ id: templateId, owner }, versionId, false, [], []);
  });

  test('sets the template to failed if the validation fails', async () => {
    const { handler, mocks } = setup();

    const event = makeGuardDutyMalwareScanResultNotificationEvent({
      detail: {
        s3ObjectDetails: {
          bucketName: 'quarantine-bucket',
          objectKey: `pdf-template/${owner}/${templateId}/${versionId}.pdf`,
        },
        scanResultDetails: {
          scanResultStatus: 'NO_THREATS_FOUND',
        },
      },
    });

    mocks.templateRepository.get.mockResolvedValueOnce({
      data: mock<DatabaseTemplate>({
        files: {
          pdfTemplate: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
          testDataCsv: {
            fileName: '',
            virusScanStatus: 'PASSED',
            currentVersion: versionId,
          },
        },
        templateStatus: 'PENDING_VALIDATION',
      }),
    });

    mocks.letterUploadRepository.download
      .mockResolvedValueOnce(Uint8Array.from('pdf'))
      .mockResolvedValueOnce(Uint8Array.from('csv'));

    const pdf = mock<TemplatePdf>({
      personalisationParameters: ['firstName', 'parameter_1'],
    });
    mocks.TemplatePdf.mockImplementation(() => pdf);

    const csv = mock<TestDataCsv>({ parameters: ['parameter_1'] });
    mocks.TestDataCsv.mockImplementation(() => csv);

    mocks.validateLetterTemplateFiles.mockReturnValue(false);

    await handler(event);

    expect(
      mocks.templateRepository.setLetterValidationResult
    ).toHaveBeenCalledWith(
      { id: templateId, owner },
      versionId,
      false,
      pdf.personalisationParameters,
      csv.parameters
    );
  });
});

describe('sqs-handler', () => {
  it('iterates over the given records and returns batch item failures', async () => {
    const { mocks } = setup();

    const lambda = new ValidateLetterTemplateFilesLambda(mocks);

    jest
      .spyOn(lambda, 'guardDutyHandler')
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Some error'));

    const event1 = makeSQSRecord({
      body: JSON.stringify(
        makeGuardDutyMalwareScanResultNotificationEvent({
          detail: {
            s3ObjectDetails: {
              bucketName: 'quarantine-bucket',
              objectKey: 'pdf-template/owner-id/template-id/version-id.pdf',
            },
          },
        })
      ),
    });
    const event2 = makeSQSRecord({
      body: JSON.stringify(
        makeGuardDutyMalwareScanResultNotificationEvent({
          detail: {
            s3ObjectDetails: {
              bucketName: 'quarantine-bucket',
              objectKey: 'test-data/owner-id/template-id/version-id.csv',
            },
          },
        })
      ),
    });

    const result = await lambda.sqsHandler({ Records: [event1, event2] });

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: event2.messageId }],
    });

    expect(lambda.guardDutyHandler).toHaveBeenCalledWith(
      JSON.parse(event1.body)
    );
    expect(lambda.guardDutyHandler).toHaveBeenCalledWith(
      JSON.parse(event2.body)
    );
  });
});
