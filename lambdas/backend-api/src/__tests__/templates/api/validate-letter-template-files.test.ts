import { mock } from 'jest-mock-extended';
import { ErrorCase } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { makeTemplateFileScannedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import type {
  TemplateRepository,
  LetterUploadRepository,
  DatabaseTemplate,
} from '@backend-api/templates/infra';
import { TemplatePdf } from '@backend-api/templates/domain/template-pdf';
import { TestDataCsv } from '@backend-api/templates/domain/test-data-csv';
import { validateLetterTemplateFiles } from '@backend-api/templates/domain/validate-letter-template-files';
import { createHandler } from '@backend-api/templates/api/validate-letter-template-files';

jest.mock('@backend-api/templates/domain/template-pdf');
jest.mock('@backend-api/templates/domain/test-data-csv');
jest.mock('@backend-api/templates/domain/validate-letter-template-files');
jest.mock('nhs-notify-web-template-management-utils/logger');
jest.mocked(logger).child.mockReturnThis();

function setup() {
  const mocks = {
    letterUploadRepository: mock<LetterUploadRepository>(),
    templateRepository: mock<TemplateRepository>(),
    TemplatePdf: jest.mocked(TemplatePdf),
    TestDataCsv: jest.mocked(TestDataCsv),
    validateLetterTemplateFiles: jest.mocked(validateLetterTemplateFiles),
  };

  const handler = createHandler(mocks);

  return { handler, mocks };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('loads the template data and associated files (pdf and csv), validates the file contents and saves the result to the database', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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

  const csv = mock<TestDataCsv>({ headers: ['parameter_1'] });
  mocks.TestDataCsv.mockImplementation(() => csv);

  mocks.validateLetterTemplateFiles.mockReturnValueOnce(true);

  await handler(event);

  expect(mocks.templateRepository.get).toHaveBeenCalledWith(
    event.detail.template.id,
    event.detail.template.owner
  );

  expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
    event.detail.template,
    'pdf-template',
    event.detail.versionId
  );

  expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
    event.detail.template,
    'test-data',
    event.detail.versionId
  );

  expect(mocks.TemplatePdf).toHaveBeenCalledWith(pdfData);
  expect(mocks.TestDataCsv).toHaveBeenCalledWith(csvData);

  expect(pdf.parse).toHaveBeenCalled();
  expect(csv.parse).toHaveBeenCalled();

  expect(mocks.validateLetterTemplateFiles).toHaveBeenCalledWith(pdf, csv);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).toHaveBeenCalledWith(
    event.detail.template,
    event.detail.versionId,
    true,
    pdf.personalisationParameters,
    csv.headers
  );
});

test('loads the template data and associated files (pdf only), validates the file contents and saves the result to the database', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: undefined,
      },
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
    event.detail.template.id,
    event.detail.template.owner
  );

  expect(mocks.letterUploadRepository.download).toHaveBeenCalledTimes(1);
  expect(mocks.letterUploadRepository.download).toHaveBeenCalledWith(
    event.detail.template,
    'pdf-template',
    event.detail.versionId
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
    event.detail.template,
    event.detail.versionId,
    true,
    pdf.personalisationParameters,
    []
  );
});

test('errors if the event is missing template id', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event is missing template owner', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event is missing file-type', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event has unknown file-type', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'unknown',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event has no version id', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'test-data',
      virusScanStatus: 'PASSED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event has no scan status', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      versionId: 'template-version-id',
      fileType: 'test-data',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test('errors if the event has FAILED scan status', async () => {
  const { handler } = setup();
  const event = {
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'test-data',
      virusScanStatus: 'FAILED',
    },
  };

  await expect(handler(event)).rejects.toThrowErrorMatchingSnapshot();
});

test("errors if the template data can't be loaded", async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    error: {
      code: ErrorCase.TEMPLATE_NOT_FOUND,
      actualError: new Error('database error'),
      message: 'Some error message',
    },
  });

  await expect(handler(event)).rejects.toThrow('Unable to load template data');

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).not.toHaveBeenCalled();
});

test('no-op if the pdf has failed virus scan', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'FAILED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
    }),
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).not.toHaveBeenCalled();
});

test('no-op if the csv has failed virus scan', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'FAILED',
          currentVersion: event.detail.versionId,
        },
      },
    }),
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).not.toHaveBeenCalled();
});

test('no-op if the event version id is non-current against the pdf', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
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
          currentVersion: event.detail.versionId,
        },
      },
    }),
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).not.toHaveBeenCalled();
});

test('no-op if the event version id is non-current against the csv', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: 'newer-version-id',
        },
      },
    }),
  });

  await handler(event);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).not.toHaveBeenCalled();
});

test('error if the pdf virus scan status is still PENDING', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PENDING',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PENDING',
          currentVersion: event.detail.versionId,
        },
      },
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

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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
  ).toHaveBeenCalledWith(
    event.detail.template,
    event.detail.versionId,
    false,
    [],
    []
  );
});

test('sets the template to failed if unable to parse the csv file', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
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
  ).toHaveBeenCalledWith(
    event.detail.template,
    event.detail.versionId,
    false,
    [],
    []
  );
});

test('sets the template to failed if the validation fails', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      template: {
        id: 'template-id',
        owner: 'template-owner',
      },
      fileType: 'pdf-template',
      versionId: 'template-version-id',
      virusScanStatus: 'PASSED',
    },
  });

  mocks.templateRepository.get.mockResolvedValueOnce({
    data: mock<DatabaseTemplate>({
      files: {
        pdfTemplate: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
        testDataCsv: {
          fileName: '',
          virusScanStatus: 'PASSED',
          currentVersion: event.detail.versionId,
        },
      },
    }),
  });

  mocks.letterUploadRepository.download
    .mockResolvedValueOnce(Uint8Array.from('pdf'))
    .mockResolvedValueOnce(Uint8Array.from('csv'));

  const pdf = mock<TemplatePdf>({
    personalisationParameters: ['firstName', 'parameter_1'],
  });
  mocks.TemplatePdf.mockImplementation(() => pdf);

  const csv = mock<TestDataCsv>({ headers: ['parameter_1'] });
  mocks.TestDataCsv.mockImplementation(() => csv);

  mocks.validateLetterTemplateFiles.mockReturnValue(false);

  await handler(event);

  expect(
    mocks.templateRepository.setLetterValidationResult
  ).toHaveBeenCalledWith(
    event.detail.template,
    event.detail.versionId,
    false,
    pdf.personalisationParameters,
    csv.headers
  );
});
