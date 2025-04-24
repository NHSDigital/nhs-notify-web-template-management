import { randomUUID } from 'node:crypto';
import { mock } from 'jest-mock-extended';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  LetterFiles,
  TemplateDto,
  CreateUpdateTemplate,
} from 'nhs-notify-backend-client';
import { TemplateRepository } from '@backend-api/templates/infra';
import { TemplateClient } from '@backend-api/templates/app/template-client';
import { LetterUploadRepository } from '@backend-api/templates/infra/letter-upload-repository';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { ProofingQueue } from '@backend-api/templates/infra/proofing-queue';

jest.mock('node:crypto');
jest.mock('nhs-notify-web-template-management-utils/logger');

const owner = '58890285E473';
const templateId = 'E1F5088E5B77';
const versionId = '28F-D4-72-A93-A6';
const defaultLetterSupplier = 'SUPPLIER';

const setup = () => {
  const enableLetters = true;

  const templateRepository = mock<TemplateRepository>();

  const letterUploadRepository = mock<LetterUploadRepository>();

  const queueMock = mock<ProofingQueue>();

  const templateClient = new TemplateClient(
    enableLetters,
    templateRepository,
    letterUploadRepository,
    queueMock,
    defaultLetterSupplier
  );

  return {
    templateClient,
    mocks: { templateRepository, letterUploadRepository, queueMock },
  };
};

describe('templateClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(randomUUID).mockReturnValue(versionId);
    jest.mocked(logger).child.mockReturnThis();
  });

  describe('createTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient } = setup();

      const data = {
        templateType: 'EMAIL',
        name: 'name',
        message: undefined,
        subject: 'subject',
      } as unknown as CreateUpdateTemplate;

      const result = await templateClient.createTemplate(data, owner);

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
        }),
      });
    });

    test('should return a failure result when attempting to create a letter', async () => {
      const { templateClient } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        letterType: 'x0',
        language: 'en',
      };

      const result = await templateClient.createTemplate(data, owner);

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
          details: {
            templateType:
              "Invalid discriminator value. Expected 'NHS_APP' | 'EMAIL' | 'SMS'",
          },
        }),
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.createTemplate(data, owner);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when created database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: templateId,
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.createTemplate(data, owner);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return created template', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.createTemplate(data, owner);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        data: expectedTemplateDto,
      });
    });
  });

  describe('createLetterTemplate', () => {
    test('should return created template', async () => {
      const { templateClient, mocks } = setup();

      const pdfFilename = 'template.pdf';
      const csvFilename = 'test-data.csv';

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], pdfFilename, {
        type: 'application/pdf',
      });

      const csv = new File(['csv'], csvFilename, { type: 'text/csv' });

      const filesWithVerions: LetterFiles = {
        pdfTemplate: {
          fileName: pdfFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: csvFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & { files: LetterFiles } = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        files: filesWithVerions,
      };

      const creationTime = '2025-03-12T08:41:08.805Z';

      const initialCreatedTemplate: DatabaseTemplate = {
        ...dataWithFiles,
        id: templateId,
        createdAt: creationTime,
        updatedAt: creationTime,
        templateStatus: 'PENDING_UPLOAD',
        owner,
        version: 1,
      };

      const updateTime = '2025-03-12T08:41:33.666Z';

      const finalTemplate: DatabaseTemplate = {
        ...initialCreatedTemplate,
        templateStatus: 'PENDING_VALIDATION',
        updatedAt: updateTime,
      };

      const { owner: _1, version: _2, ...expectedDto } = finalTemplate;

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      mocks.templateRepository.updateStatus.mockResolvedValueOnce({
        data: finalTemplate,
      });

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf,
        csv
      );

      expect(result).toEqual({
        data: expectedDto,
      });

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        owner,
        'PENDING_UPLOAD'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        owner,
        versionId,
        pdf,
        csv
      );

      expect(mocks.templateRepository.updateStatus).toHaveBeenCalledWith(
        templateId,
        owner,
        'PENDING_VALIDATION'
      );
    });

    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: undefined,
      } as unknown as CreateUpdateTemplate;

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
          details: { letterType: 'Required, Required' },
        }),
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result, when attempting to create a non-letter', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'NHS_APP',
        name: 'name',
        message: 'app message',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
          details: expect.objectContaining({
            templateType: `Invalid literal value, expected "LETTER"`,
          }),
        }),
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    const invalidPdfCases: { case: string; pdf: File }[] = [
      {
        case: 'no file type',
        pdf: new File(['pdf'], 'template.pdf'),
      },
      {
        case: 'wrong file type',
        pdf: new File(['pdf'], 'template.pdf', { type: 'application/json' }),
      },
      {
        case: 'empty file name',
        pdf: new File(['pdf'], '', { type: 'application/pdf' }),
      },
    ];

    test.each(invalidPdfCases)(
      'return a failure result when pdf has $case',
      async ({ pdf }) => {
        const { templateClient, mocks } = setup();

        const data: CreateUpdateTemplate = {
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
        };

        const result = await templateClient.createLetterTemplate(
          data,
          owner,
          pdf
        );

        expect(result).toEqual({
          error: expect.objectContaining({
            code: 400,
            message: 'Failed to identify or validate PDF data',
          }),
        });

        expect(mocks.templateRepository.create).not.toHaveBeenCalled();
      }
    );

    const invalidCsvCases: { case: string; csv: File }[] = [
      {
        case: 'no file type',
        csv: new File(['csv'], 'data.csv'),
      },
      {
        case: 'wrong file type',
        csv: new File(['csv'], 'data.csv', { type: 'application/pdf' }),
      },
      {
        case: 'empty file name',
        csv: new File(['csv'], '', { type: 'text/csv' }),
      },
    ];

    test.each(invalidCsvCases)(
      'return a failure result when test data csv has $case',
      async ({ csv }) => {
        const { templateClient, mocks } = setup();

        const data: CreateUpdateTemplate = {
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
        };

        const pdf = new File(['pdf'], 'template.pdf', {
          type: 'application/pdf',
        });

        const result = await templateClient.createLetterTemplate(
          data,
          owner,
          pdf,
          csv
        );

        expect(result).toEqual({
          error: expect.objectContaining({
            code: 400,
            message: 'Failed to validate CSV data',
          }),
        });

        expect(mocks.templateRepository.create).not.toHaveBeenCalled();
      }
    );

    test('should return a failure result when intial template creation fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVerions: LetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & { files: LetterFiles } = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        files: filesWithVerions,
      };

      const templateRepoFailure = {
        error: {
          actualError: new Error('ddb err'),
          code: 500,
          message: 'Failed to create template',
        },
      };

      mocks.templateRepository.create.mockResolvedValueOnce(
        templateRepoFailure
      );

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual(templateRepoFailure);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        owner,
        'PENDING_UPLOAD'
      );

      expect(mocks.letterUploadRepository.upload).not.toHaveBeenCalled();
      expect(mocks.templateRepository.update).not.toHaveBeenCalled();
    });

    test('should return a failure result when initially created database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: {} as unknown as DatabaseTemplate,
      });

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });

      expect(mocks.letterUploadRepository.upload).not.toHaveBeenCalled();
      expect(mocks.templateRepository.update).not.toHaveBeenCalled();
    });

    test('should return a failure result when failing to upload letter files', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVerions: LetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & { files: LetterFiles } = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        files: filesWithVerions,
      };

      const expectedTemplateDto: TemplateDto = {
        ...dataWithFiles,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'PENDING_VALIDATION',
      };

      const initialCreatedTemplate: DatabaseTemplate = {
        ...expectedTemplateDto,
        templateStatus: 'PENDING_UPLOAD',
        owner,
        version: 1,
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      const uploadErr = {
        error: {
          actualError: expect.objectContaining({
            message: 'Failed to upload letter files',
            cause: [
              expect.objectContaining({ message: 'could not upload' }),
              expect.objectContaining({ message: 'could not upload' }),
            ],
          }),
          code: 500,
          details: undefined,
          message: 'Failed to upload letter files',
        },
      };

      mocks.letterUploadRepository.upload.mockResolvedValueOnce(uploadErr);

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual(uploadErr);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        owner,
        'PENDING_UPLOAD'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        owner,
        versionId,
        pdf,
        undefined
      );

      expect(mocks.templateRepository.update).not.toHaveBeenCalled();
    });

    test('should return a failure result when final update fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVerions: LetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & { files: LetterFiles } = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        files: filesWithVerions,
      };

      const expectedTemplateDto: TemplateDto = {
        ...dataWithFiles,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'PENDING_VALIDATION',
      };

      const initialCreatedTemplate: DatabaseTemplate = {
        ...expectedTemplateDto,
        templateStatus: 'PENDING_UPLOAD',
        owner,
        version: 1,
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      const updateErr = {
        error: {
          actualError: new Error('ddb err'),
          code: 500,
          message: 'Failed to update template',
        },
      };

      mocks.templateRepository.updateStatus.mockResolvedValueOnce(updateErr);

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf
      );

      expect(result).toEqual(updateErr);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        owner,
        'PENDING_UPLOAD'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        owner,
        versionId,
        pdf,
        undefined
      );

      expect(mocks.templateRepository.updateStatus).toHaveBeenCalledWith(
        templateId,
        owner,
        'PENDING_VALIDATION'
      );
    });

    test('should return a failure result when final statusUpdate returns an invalid result', async () => {
      const { templateClient, mocks } = setup();

      const pdfFilename = 'template.pdf';
      const csvFilename = 'test-data.csv';

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], pdfFilename, {
        type: 'application/pdf',
      });

      const csv = new File(['csv'], csvFilename, { type: 'text/csv' });

      const filesWithVerions: LetterFiles = {
        pdfTemplate: {
          fileName: pdfFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: csvFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & { files: LetterFiles } = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        files: filesWithVerions,
      };

      const creationTime = '2025-03-12T08:41:08.805Z';

      const initialCreatedTemplate: DatabaseTemplate = {
        ...dataWithFiles,
        id: templateId,
        createdAt: creationTime,
        updatedAt: creationTime,
        templateStatus: 'PENDING_UPLOAD',
        owner,
        version: 1,
      };

      const updateTime = '2025-03-12T08:41:33.666Z';

      const finalTemplate: DatabaseTemplate = {
        ...initialCreatedTemplate,
        templateStatus: 'PENDING_VALIDATION',
        updatedAt: updateTime,
      };

      const { owner: _1, version: _2 } = finalTemplate;

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      mocks.templateRepository.updateStatus.mockResolvedValueOnce({
        data: {
          ...finalTemplate,
          updatedAt: undefined as unknown as string,
        },
      });

      const result = await templateClient.createLetterTemplate(
        data,
        owner,
        pdf,
        csv
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return a failure result when letters feature flag is not enabled', async () => {
      const { mocks } = setup();

      const client = new TemplateClient(
        false,
        mocks.templateRepository,
        mocks.letterUploadRepository,
        mocks.queueMock,
        defaultLetterSupplier
      );

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const result = await client.createLetterTemplate(data, owner, pdf);

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
        }),
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
      expect(mocks.letterUploadRepository.upload).not.toHaveBeenCalled();
    });
  });

  describe('updateTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient } = setup();

      const data = {
        name: 'name',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const result = await templateClient.updateTemplate(
        templateId,
        data as unknown as CreateUpdateTemplate,
        owner
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
        }),
      });
    });

    test('should return a failure result when attempting to update a letter', async () => {
      const { templateClient } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        templateType: 'LETTER',
        language: 'it',
        letterType: 'q1',
      };

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        owner
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
          details: {
            templateType:
              "Invalid discriminator value. Expected 'NHS_APP' | 'EMAIL' | 'SMS'",
          },
        }),
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        owner
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when updated database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: templateId,
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        owner
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return updated template', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      const template: TemplateDto = {
        ...data,
        id: templateId,
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        owner
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        owner,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('getTemplate', () => {
    test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.get.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.getTemplate(templateId, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const templateDTO: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...templateDTO,
        owner,
        version: 1,
      };

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.getTemplate(templateId, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return a failure result, when fetching a letter, if letter flag is not enabled', async () => {
      const { mocks } = setup();

      const noLettersClient = new TemplateClient(
        false,
        mocks.templateRepository,
        mocks.letterUploadRepository,
        mocks.queueMock,
        defaultLetterSupplier
      );

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          id: templateId,
          templateType: 'LETTER',
          name: 'name',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: 'NOT_YET_SUBMITTED',
          letterType: 'q4',
          language: 'fr',
          owner,
          version: 1,
        },
      });

      const result = await noLettersClient.getTemplate(templateId, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 404,
          message: 'Template not found',
        },
      });
    });

    test('should return template', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const result = await templateClient.getTemplate(templateId, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('listTemplates', () => {
    test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.list.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.listTemplates(owner);

      expect(mocks.templateRepository.list).toHaveBeenCalledWith(owner);

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('filters out letters if the feature flag is not enabled', async () => {
      const { mocks } = setup();

      const noLettersClient = new TemplateClient(
        false,
        mocks.templateRepository,
        mocks.letterUploadRepository,
        mocks.queueMock,
        defaultLetterSupplier
      );

      const template: TemplateDto = {
        id: templateId,
        templateType: 'LETTER',
        name: 'name',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'q4',
        language: 'fr',
        files: {
          pdfTemplate: {
            fileName: 'file.pdf',
            currentVersion: 'uuid',
            virusScanStatus: 'PENDING',
          },
          testDataCsv: {
            fileName: 'file.csv',
            currentVersion: 'uuid',
            virusScanStatus: 'PENDING',
          },
        },
      };

      mocks.templateRepository.list.mockResolvedValueOnce({
        data: [{ ...template, owner, version: 1 }],
      });

      const result = await noLettersClient.listTemplates(owner);

      expect(mocks.templateRepository.list).toHaveBeenCalledWith(owner);

      expect(result).toEqual({
        data: [],
      });
    });

    test('should filter out invalid templates', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };
      const template2: TemplateDto = {
        id: undefined as unknown as string,
        templateType: 'EMAIL',
        name: undefined as unknown as string,
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      mocks.templateRepository.list.mockResolvedValueOnce({
        data: [
          { ...template, owner, version: 1 },
          { ...template2, owner, version: 1 },
        ],
      });

      const result = await templateClient.listTemplates(owner);

      expect(mocks.templateRepository.list).toHaveBeenCalledWith(owner);

      expect(result).toEqual({
        data: [template],
      });
    });

    test('should return templates', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      mocks.templateRepository.list.mockResolvedValueOnce({
        data: [{ ...template, owner, version: 1 }],
      });

      const result = await templateClient.listTemplates(owner);

      expect(mocks.templateRepository.list).toHaveBeenCalledWith(owner);

      expect(result).toEqual({
        data: [template],
      });
    });
  });

  describe('submitTemplate', () => {
    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.submit.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.submitTemplate(templateId, owner);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when updated database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const expectedTemplateDto: TemplateDto = {
        id: templateId,
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'SUBMITTED',
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      mocks.templateRepository.submit.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.submitTemplate(templateId, owner);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return updated template', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        name: 'name',
        message: 'message',
        templateStatus: 'SUBMITTED',
        templateType: 'SMS',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mocks.templateRepository.submit.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const result = await templateClient.submitTemplate(templateId, owner);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('requestProof', () => {
    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.requestProof(templateId, owner);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when updated database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const expectedTemplateDto: TemplateDto = {
        id: templateId,
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'SUBMITTED',
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.requestProof(templateId, owner);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return a failure result, when updated database template not a letter', async () => {
      const { templateClient, mocks } = setup();

      const expectedTemplateDto: TemplateDto = {
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'SUBMITTED',
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner,
        version: 1,
      };

      // This is not actually possible, because the update is conditional on
      // templateTypebeing LETTER
      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.requestProof(templateId, owner);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Unexpected template type',
        },
      });
    });

    test('should return a failure result, when failing to send to SQS', async () => {
      const { templateClient, mocks } = setup();

      const pdfVersionId = 'a';
      const personalisationParameters = ['myParam'];

      const template: TemplateDto = {
        name: 'name',
        templateStatus: 'SUBMITTED',
        templateType: 'LETTER',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personalisationParameters,
        letterType: 'q1',
        language: 'en',
        files: {
          pdfTemplate: {
            virusScanStatus: 'PASSED',
            currentVersion: pdfVersionId,
            fileName: 'template.pdf',
          },
        },
      };

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const clientErr = new Error('sqs err');

      mocks.queueMock.send.mockResolvedValueOnce({
        error: {
          message: 'Failed to send to proofing queue',
          code: 500,
          actualError: clientErr,
        },
      });

      const result = await templateClient.requestProof(templateId, owner);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(mocks.queueMock.send).toHaveBeenCalledTimes(1);
      expect(mocks.queueMock.send).toHaveBeenCalledWith(
        templateId,
        owner,
        personalisationParameters,
        pdfVersionId,
        undefined,
        defaultLetterSupplier
      );

      expect(result).toEqual({
        error: {
          code: 500,
          actualError: clientErr,
          message: 'Failed to send to proofing queue',
        },
      });
    });

    test('should return updated template', async () => {
      const { templateClient, mocks } = setup();

      const pdfVersionId = 'a';
      const personalisationParameters = ['myParam'];

      const template: TemplateDto = {
        name: 'name',
        templateStatus: 'SUBMITTED',
        templateType: 'LETTER',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personalisationParameters,
        letterType: 'q1',
        language: 'en',
        files: {
          pdfTemplate: {
            virusScanStatus: 'PASSED',
            currentVersion: pdfVersionId,
            fileName: 'template.pdf',
          },
        },
      };

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      mocks.queueMock.send.mockResolvedValueOnce({ data: { $metadata: {} } });

      const result = await templateClient.requestProof(templateId, owner);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(mocks.queueMock.send).toHaveBeenCalledTimes(1);
      expect(mocks.queueMock.send).toHaveBeenCalledWith(
        templateId,
        owner,
        personalisationParameters,
        pdfVersionId,
        undefined,
        defaultLetterSupplier
      );

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('deleteTemplate', () => {
    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.delete.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.deleteTemplate(templateId, owner);

      expect(mocks.templateRepository.delete).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return nothing when successful', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        name: 'name',
        message: 'message',
        templateStatus: 'DELETED',
        templateType: 'SMS',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mocks.templateRepository.delete.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const result = await templateClient.deleteTemplate(templateId, owner);

      expect(mocks.templateRepository.delete).toHaveBeenCalledWith(
        templateId,
        owner
      );

      expect(result).toEqual({
        data: undefined,
      });
    });
  });
});
