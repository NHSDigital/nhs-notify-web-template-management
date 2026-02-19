import { File } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { mock } from 'jest-mock-extended';
import type {
  PdfLetterFiles,
  TemplateDto,
  CreateUpdateTemplate,
  ClientConfiguration,
  AuthoringLetterFiles,
} from 'nhs-notify-backend-client';
import { TemplateRepository } from '../../infra';
import { TemplateClient } from '../../app/template-client';
import { LetterUploadRepository } from '../../infra/letter-upload-repository';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { ProofingQueue } from '../../infra/proofing-queue';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { ClientConfigRepository } from '../../infra/client-config-repository';
import { RoutingConfigRepository } from '../../infra/routing-config-repository';
import { isRightToLeft } from 'nhs-notify-web-template-management-utils/enum';

import { TemplateQuery } from '../../infra/template-repository/query';
import { TemplateFilter } from 'nhs-notify-backend-client/src/types/filters';

jest.mock('node:crypto');
jest.mock('nhs-notify-web-template-management-utils/enum');

const user = { internalUserId: '58890285E473', clientId: '00F2EF8D16FD' };
const templateId = 'E1F5088E5B77';
const templateName = 'template-name';
const versionId = '28F-D4-72-A93-A6';
const defaultLetterSupplier = 'SUPPLIER';

const setup = () => {
  const templateRepository = mock<TemplateRepository>();

  const letterUploadRepository = mock<LetterUploadRepository>();

  const queueMock = mock<ProofingQueue>();

  const clientConfigRepository = mock<ClientConfigRepository>();

  const routingConfigRepository = mock<RoutingConfigRepository>();

  const { logger, logMessages } = createMockLogger();

  const templateClient = new TemplateClient(
    templateRepository,
    letterUploadRepository,
    queueMock,
    defaultLetterSupplier,
    clientConfigRepository,
    routingConfigRepository,
    logger
  );

  const isRightToLeftMock = jest.mocked(isRightToLeft);

  isRightToLeftMock.mockReturnValueOnce(false);

  const queryMock = mock<TemplateQuery>({
    templateStatus: jest.fn().mockReturnThis(),
    excludeTemplateStatus: jest.fn().mockReturnThis(),
    templateType: jest.fn().mockReturnThis(),
    language: jest.fn().mockReturnThis(),
    excludeLanguage: jest.fn().mockReturnThis(),
    letterType: jest.fn().mockReturnThis(),
  });

  return {
    templateClient,
    mocks: {
      templateRepository,
      letterUploadRepository,
      queueMock,
      logger,
      clientConfigRepository,
      routingConfigRepository,
      isRightToLeftMock,
      queryMock,
    },
    logMessages,
  };
};

describe('templateClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(randomUUID).mockReturnValue(versionId);
  });

  describe('isCampaignIdValid', () => {
    test('no client configuration', () => {
      const { templateClient } = setup();
      expect(templateClient.isCampaignIdValid(null, 'bean-campaign')).toEqual(
        false
      );
    });

    test('campaign ID in campaignIds list', () => {
      const { templateClient } = setup();
      expect(
        templateClient.isCampaignIdValid(
          {
            features: {},
            campaignIds: ['bean-campaign', 'pea-campaign'],
          },
          'bean-campaign'
        )
      ).toEqual(true);
    });

    test('campaign ID not in campaignIds list', () => {
      const { templateClient } = setup();
      expect(
        templateClient.isCampaignIdValid(
          {
            features: {},
            campaignIds: ['pea-campaign'],
          },
          'bean-campaign'
        )
      ).toEqual(false);
    });

    test('campaignIds not present', () => {
      const { templateClient } = setup();
      expect(
        templateClient.isCampaignIdValid(
          {
            features: {},
          },
          'bean-campaign'
        )
      ).toEqual(false);
    });
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

      const result = await templateClient.createTemplate(data, user);

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            fieldErrors: {
              message: ['Invalid input: expected string, received undefined'],
            },
          }),
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
          }),
        },
      });
    });

    test('should return a failure result when attempting to create a letter', async () => {
      const { templateClient } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        letterType: 'x0',
        language: 'en',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const result = await templateClient.createTemplate(data, user);

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            fieldErrors: {
              templateType: ['Invalid input'],
            },
          }),
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
            details: {
              templateType: 'Invalid input',
            },
          }),
        },
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: null,
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.createTemplate(data, user);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        user,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
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
        lockNumber: 1,
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { proofing: true } },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.createTemplate(data, user);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        user,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
        },
      });
    });

    test('should return created template', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        message: 'message',
        name: 'name',
        subject: 'subject',
        templateType: 'EMAIL',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        createdAt: new Date().toISOString(),
        id: templateId,
        templateStatus: 'NOT_YET_SUBMITTED',
        updatedAt: new Date().toISOString(),
        lockNumber: 1,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: template,
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.createTemplate(data, user);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        data,
        user,
        'NOT_YET_SUBMITTED'
      );

      expect(result).toEqual({
        data: expectedTemplateDto,
      });
    });
  });

  describe('uploadDocxTemplate', () => {
    test('should return created template', async () => {
      const { templateClient, mocks } = setup();

      const docxFilename = 'template.docx';

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      const docxTemplate = new File(['docxTemplate'], docxFilename, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const filesWithVersions: AuthoringLetterFiles = {
        docxTemplate: {
          fileName: docxFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & {
        files: AuthoringLetterFiles;
      } = {
        ...data,
        files: filesWithVersions,
      };

      const creationTime = '2025-03-12T08:41:08.805Z';

      const createdTemplate: DatabaseTemplate = {
        ...dataWithFiles,
        id: templateId,
        createdAt: creationTime,
        updatedAt: creationTime,
        templateStatus: 'PENDING_UPLOAD',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
        letterVersion: 'AUTHORING',
      };

      const { version: _1, owner: _2, ...expectedDto } = createdTemplate;

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: createdTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        docxTemplate
      );

      console.log('RESULT', result);
      console.log('EXPECT', expectedDto);

      expect(result).toEqual({
        data: {
          ...expectedDto,
          lockNumber: 0,
        },
      });

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        user,
        'PENDING_VALIDATION',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        user,
        versionId,
        docxTemplate,
        'docx-template'
      );
    });

    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: undefined,
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      } as unknown as CreateUpdateTemplate;

      const pdf = new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const result = await templateClient.uploadDocxTemplate(data, user, pdf);

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
            details: expect.objectContaining({
              letterType: 'Invalid option: expected one of "q4"|"x0"|"x1"',
            }),
          }),
        }),
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    const invalidDocxCases: { case: string; file: File }[] = [
      {
        case: 'no file type',
        file: new File(['docxTemplate'], 'template.docx'),
      },
      {
        case: 'wrong file type',
        file: new File(['docxTemplate'], 'template.docx', {
          type: 'application/json',
        }),
      },
      {
        case: 'empty file name',
        file: new File(['docxTemplate'], '', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      },
    ];

    test.each(invalidDocxCases)(
      'return a failure result when pdf has $case',
      async ({ file }) => {
        const { templateClient, mocks } = setup();

        const data: CreateUpdateTemplate = {
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
          campaignId: 'campaign-id',
          letterVersion: 'AUTHORING',
        };

        const result = await templateClient.uploadDocxTemplate(
          data,
          user,
          file
        );

        expect(result).toEqual({
          error: {
            errorMeta: expect.objectContaining({
              code: 400,
              description: 'Failed to identify or validate DOCX data',
            }),
          },
        });

        expect(mocks.templateRepository.create).not.toHaveBeenCalled();
      }
    );

    test("should return a failure result if client configuration unexpectedly can't be fetched", async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        new File(['docxTemplate'], 'template.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      );

      expect(result).toEqual({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result if campaign ID is not valid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: {}, campaignIds: ['fish-campaign'] },
      });

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        new File(['docxTemplate'], 'template.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            description: 'Invalid campaign ID in request',
            code: 400,
          },
        },
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result when initial template creation fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      const docxTemplate = new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const dataWithFiles = {
        ...data,
        files: {
          docxTemplate: {
            fileName: 'template.docx',
            currentVersion: versionId,
            virusScanStatus: 'PENDING',
          },
        },
      };

      const templateRepoFailure = {
        error: {
          actualError: new Error('ddb err'),
          errorMeta: {
            code: 500,
            description: 'Failed to create template',
          },
        },
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce(
        templateRepoFailure
      );

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        docxTemplate
      );

      expect(result).toEqual(templateRepoFailure);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        user,
        'PENDING_VALIDATION',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).not.toHaveBeenCalled();
    });

    test('should return a failure result when initially created database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      const docxTemplate = new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: {} as unknown as DatabaseTemplate,
      });

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        docxTemplate
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
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
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      const docxTemplate = new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const filesWithVersions: AuthoringLetterFiles = {
        docxTemplate: {
          fileName: 'template.docx',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      };

      const dataWithFiles: CreateUpdateTemplate & {
        files: AuthoringLetterFiles;
      } = {
        ...data,
        files: filesWithVersions,
      };

      const expectedTemplateDto: TemplateDto = {
        ...dataWithFiles,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'PENDING_VALIDATION',
        lockNumber: 1,
        letterVersion: 'AUTHORING',
      };

      const createdTemplate: DatabaseTemplate = {
        ...expectedTemplateDto,
        templateStatus: 'PENDING_VALIDATION',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: createdTemplate,
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
          errorMeta: {
            code: 500,
            details: undefined,
            description: 'Failed to upload letter files',
          },
        },
      };

      mocks.letterUploadRepository.upload.mockResolvedValueOnce(uploadErr);

      const result = await templateClient.uploadDocxTemplate(
        data,
        user,
        docxTemplate
      );

      expect(result).toEqual(uploadErr);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        dataWithFiles,
        user,
        'PENDING_VALIDATION',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        user,
        versionId,
        docxTemplate,
        'docx-template'
      );

      expect(mocks.templateRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('uploadLetterTemplate', () => {
    test('should return created template', async () => {
      const { templateClient, mocks } = setup();

      const pdfFilename = 'template.pdf';
      const csvFilename = 'test-data.csv';

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], pdfFilename, {
        type: 'application/pdf',
      });

      const csv = new File(['csv'], csvFilename, { type: 'text/csv' });

      const filesWithVersions: PdfLetterFiles = {
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
        proofs: {},
      };

      const dataWithFiles: CreateUpdateTemplate & { files: PdfLetterFiles } = {
        ...data,
        files: filesWithVersions,
      };

      const creationTime = '2025-03-12T08:41:08.805Z';

      const initialCreatedTemplate: DatabaseTemplate = {
        ...dataWithFiles,
        id: templateId,
        createdAt: creationTime,
        updatedAt: creationTime,
        templateStatus: 'PENDING_UPLOAD',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
        letterVersion: 'PDF',
      };

      const updateTime = '2025-03-12T08:41:33.666Z';

      const finalTemplate: DatabaseTemplate = {
        ...initialCreatedTemplate,
        templateStatus: 'PENDING_VALIDATION',
        updatedAt: updateTime,
        lockNumber: 1,
      };

      const { version: _1, owner: _2, ...expectedDto } = finalTemplate;

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      mocks.templateRepository.finaliseLetterUpload.mockResolvedValueOnce({
        data: finalTemplate,
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.uploadLetterTemplate(
        data,
        user,
        pdf,
        csv
      );

      expect(result).toEqual({
        data: expectedDto,
      });

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        { ...dataWithFiles, proofingEnabled: true },
        user,
        'PENDING_UPLOAD',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        user,
        versionId,
        pdf,
        'pdf-template',
        csv
      );

      expect(
        mocks.templateRepository.finaliseLetterUpload
      ).toHaveBeenCalledWith(templateId, user);
    });

    const proofingEnabledFieldCases = [
      {
        clientEnabledProofing: true,
        isRTLLanguage: true,
        expected: false,
      },
      {
        clientEnabledProofing: true,
        isRTLLanguage: false,
        expected: true,
      },
      {
        clientEnabledProofing: false,
        isRTLLanguage: true,
        expected: false,
      },
      {
        clientEnabledProofing: undefined,
        isRTLLanguage: true,
        expected: false,
      },
    ];

    test.each(proofingEnabledFieldCases)(
      'should return created template with proofingEnabled $expected when client proofing is $clientEnabledProofing and language Right to Left is $isRTLLanguage',
      async ({ clientEnabledProofing, isRTLLanguage, expected }) => {
        const { templateClient, mocks } = setup();

        mocks.isRightToLeftMock.mockReset();

        mocks.isRightToLeftMock.mockReturnValueOnce(isRTLLanguage);

        const pdfFilename = 'template.pdf';
        const csvFilename = 'test-data.csv';

        const data: CreateUpdateTemplate = {
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
          campaignId: 'campaign-id',
          letterVersion: 'PDF',
        };

        const pdf = new File(['pdf'], pdfFilename, {
          type: 'application/pdf',
        });

        const csv = new File(['csv'], csvFilename, { type: 'text/csv' });

        const filesWithVersions: PdfLetterFiles = {
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
          proofs: {},
        };

        const dataWithFiles: CreateUpdateTemplate & { files: PdfLetterFiles } =
          {
            ...data,
            files: filesWithVersions,
          };

        const creationTime = '2025-03-12T08:41:08.805Z';

        const initialCreatedTemplate: DatabaseTemplate = {
          ...dataWithFiles,
          id: templateId,
          createdAt: creationTime,
          updatedAt: creationTime,
          templateStatus: 'PENDING_UPLOAD',
          proofingEnabled: expected,
          owner: `CLIENT#${user.clientId}`,
          version: 1,
          letterVersion: 'PDF',
        };

        const updateTime = '2025-03-12T08:41:33.666Z';

        const finalTemplate: DatabaseTemplate = {
          ...initialCreatedTemplate,
          templateStatus: 'PENDING_VALIDATION',
          updatedAt: updateTime,
          lockNumber: 1,
        };

        const { version: _1, owner: _2, ...expectedDto } = finalTemplate;

        mocks.templateRepository.create.mockResolvedValueOnce({
          data: initialCreatedTemplate,
        });

        mocks.letterUploadRepository.upload.mockResolvedValueOnce({
          data: null,
        });

        mocks.templateRepository.finaliseLetterUpload.mockResolvedValueOnce({
          data: finalTemplate,
        });

        mocks.clientConfigRepository.get.mockResolvedValueOnce({
          data: {
            campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
            features: { proofing: clientEnabledProofing },
          },
        });

        const result = await templateClient.uploadLetterTemplate(
          data,
          user,
          pdf,
          csv
        );

        expect(result).toEqual({
          data: expectedDto,
        });

        expect(mocks.templateRepository.create).toHaveBeenCalledWith(
          { ...dataWithFiles, proofingEnabled: expected },
          user,
          'PENDING_UPLOAD',
          'campaign-id'
        );
      }
    );

    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient, mocks } = setup();

      const data = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: undefined,
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      } as unknown as CreateUpdateTemplate;

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
            details: expect.objectContaining({
              letterType: 'Invalid option: expected one of "q4"|"x0"|"x1"',
            }),
          }),
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

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
            details: expect.objectContaining({
              templateType: 'Invalid input: expected "LETTER"',
            }),
          }),
        }),
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result, when letterVersion is not PDF', async () => {
      const { templateClient, mocks } = setup();

      const data = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const result = await templateClient.uploadLetterTemplate(
        data as CreateUpdateTemplate,
        user,
        pdf
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
          }),
        }),
      });

      expect(result.error?.errorMeta.details).toMatchObject({
        letterVersion: expect.stringContaining('Invalid input: expected "PDF"'),
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
          campaignId: 'campaign-id',
          letterVersion: 'PDF',
        };

        const result = await templateClient.uploadLetterTemplate(
          data,
          user,
          pdf
        );

        expect(result).toEqual({
          error: {
            errorMeta: expect.objectContaining({
              code: 400,
              description: 'Failed to identify or validate PDF data',
            }),
          },
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
          campaignId: 'campaign-id',
          letterVersion: 'PDF',
        };

        const pdf = new File(['pdf'], 'template.pdf', {
          type: 'application/pdf',
        });

        const result = await templateClient.uploadLetterTemplate(
          data,
          user,
          pdf,
          csv
        );

        expect(result).toEqual({
          error: {
            errorMeta: expect.objectContaining({
              code: 400,
              description: 'Failed to validate CSV data',
            }),
          },
        });

        expect(mocks.templateRepository.create).not.toHaveBeenCalled();
      }
    );

    test('should return a failure result if client configuration unexpectedly cant be fetched', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      const result = await templateClient.uploadLetterTemplate(
        data,
        user,
        new File(['pdf'], 'template.pdf', {
          type: 'application/pdf',
        })
      );

      expect(result).toEqual({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result if campaign ID is not valid', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: {}, campaignIds: ['fish-campaign'] },
      });

      const result = await templateClient.uploadLetterTemplate(
        data,
        user,
        new File(['pdf'], 'template.pdf', {
          type: 'application/pdf',
        })
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            description: 'Invalid campaign ID in request',
            code: 400,
          },
        },
      });

      expect(mocks.templateRepository.create).not.toHaveBeenCalled();
    });

    test('should return a failure result when initial template creation fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        templateType: 'LETTER',
        name: 'name',
        language: 'en',
        letterType: 'x0',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVersions: PdfLetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        proofs: {},
      };

      const dataWithFiles: CreateUpdateTemplate & { files: PdfLetterFiles } = {
        ...data,
        files: filesWithVersions,
      };

      const templateRepoFailure = {
        error: {
          actualError: new Error('ddb err'),
          errorMeta: {
            code: 500,
            description: 'Failed to create template',
          },
        },
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce(
        templateRepoFailure
      );

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual(templateRepoFailure);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        { ...dataWithFiles, proofingEnabled: false },
        user,
        'PENDING_UPLOAD',
        'campaign-id'
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
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: {} as unknown as DatabaseTemplate,
      });

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
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
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVersions: PdfLetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        proofs: {},
      };

      const dataWithFiles: CreateUpdateTemplate & { files: PdfLetterFiles } = {
        ...data,
        files: filesWithVersions,
      };

      const expectedTemplateDto: TemplateDto = {
        ...dataWithFiles,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'PENDING_VALIDATION',
        lockNumber: 1,
        letterVersion: 'PDF',
      };

      const initialCreatedTemplate: DatabaseTemplate = {
        ...expectedTemplateDto,
        templateStatus: 'PENDING_UPLOAD',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

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
          errorMeta: {
            code: 500,
            details: undefined,
            description: 'Failed to upload letter files',
          },
        },
      };

      mocks.letterUploadRepository.upload.mockResolvedValueOnce(uploadErr);

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual(uploadErr);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        { ...dataWithFiles, proofingEnabled: false },
        user,
        'PENDING_UPLOAD',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        user,
        versionId,
        pdf,
        'pdf-template',
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
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], 'template.pdf', {
        type: 'application/pdf',
      });

      const filesWithVersions: PdfLetterFiles = {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        proofs: {},
      };

      const dataWithFiles: CreateUpdateTemplate & { files: PdfLetterFiles } = {
        ...data,
        files: filesWithVersions,
      };

      const expectedTemplateDto: TemplateDto = {
        ...dataWithFiles,
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'PENDING_VALIDATION',
        lockNumber: 1,
        letterVersion: 'PDF',
      };

      const initialCreatedTemplate: DatabaseTemplate = {
        ...expectedTemplateDto,
        templateStatus: 'PENDING_UPLOAD',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: false },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      const updateErr = {
        error: {
          actualError: new Error('ddb err'),
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      };

      mocks.templateRepository.finaliseLetterUpload.mockResolvedValueOnce(
        updateErr
      );

      const result = await templateClient.uploadLetterTemplate(data, user, pdf);

      expect(result).toEqual(updateErr);

      expect(mocks.templateRepository.create).toHaveBeenCalledWith(
        { ...dataWithFiles, proofingEnabled: false },
        user,
        'PENDING_UPLOAD',
        'campaign-id'
      );

      expect(mocks.letterUploadRepository.upload).toHaveBeenCalledWith(
        templateId,
        user,
        versionId,
        pdf,
        'pdf-template',
        undefined
      );

      expect(
        mocks.templateRepository.finaliseLetterUpload
      ).toHaveBeenCalledWith(templateId, user);
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
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const pdf = new File(['pdf'], pdfFilename, {
        type: 'application/pdf',
      });

      const csv = new File(['csv'], csvFilename, { type: 'text/csv' });

      const filesWithVersions: PdfLetterFiles = {
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

      const creationTime = '2025-03-12T08:41:08.805Z';

      const initialCreatedTemplate: DatabaseTemplate = {
        ...data,
        files: filesWithVersions,
        id: templateId,
        createdAt: creationTime,
        updatedAt: creationTime,
        templateStatus: 'PENDING_UPLOAD',
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      const updateTime = '2025-03-12T08:41:33.666Z';

      const finalTemplate: DatabaseTemplate = {
        ...initialCreatedTemplate,
        templateStatus: 'PENDING_VALIDATION',
        updatedAt: updateTime,
      };

      const { owner: _1, version: _2 } = finalTemplate;

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
          features: { proofing: true },
        },
      });

      mocks.templateRepository.create.mockResolvedValueOnce({
        data: initialCreatedTemplate,
      });

      mocks.letterUploadRepository.upload.mockResolvedValueOnce({ data: null });

      mocks.templateRepository.finaliseLetterUpload.mockResolvedValueOnce({
        data: {
          ...finalTemplate,
          updatedAt: undefined as unknown as string,
        },
      });

      const result = await templateClient.uploadLetterTemplate(
        data,
        user,
        pdf,
        csv
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
        },
      });
    });
  });

  describe('updateTemplate', () => {
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
        lockNumber: 2,
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        user,
        1
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(result).toEqual({
        data: template,
      });
    });

    test('updateTemplate should return a failure result, when template data is invalid', async () => {
      const { templateClient } = setup();

      const data = {
        name: 'name',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const result = await templateClient.updateTemplate(
        templateId,
        data as unknown as CreateUpdateTemplate,
        user,
        1
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
          }),
        }),
      });
    });

    test('should return a failure result when attempting to update a letter', async () => {
      const { templateClient } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        templateType: 'LETTER',
        language: 'it',
        letterType: 'x1',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      };

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        user,
        1
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              templateType: 'Invalid input',
            },
          },
        }),
      });
    });

    describe('lock number parsing', () => {
      const errorCases: [string, string | number][] = [
        ['empty', ''],
        ['negative', -1],
        ['negative stringified', -1],
        ['non-number string', 'a'],
        ['NaN', Number.NaN],
        ['NaN stringified', 'NaN'],
      ];
      test.each(errorCases)(
        'should return a failure result when lockNumber is invalid: %s',
        async (_, lockNumber) => {
          const { templateClient } = setup();

          const data: CreateUpdateTemplate = {
            name: 'name',
            templateType: 'NHS_APP',
            message: 'new-message',
          };

          const result = await templateClient.updateTemplate(
            templateId,
            data,
            user,
            lockNumber
          );

          expect(result).toEqual({
            error: expect.objectContaining({
              errorMeta: {
                code: 400,
                description: 'Invalid lock number provided',
              },
            }),
          });
        }
      );

      test('coerces stringified lock number to number', async () => {
        const { templateClient, mocks } = setup();

        const data: CreateUpdateTemplate = {
          name: 'name',
          templateType: 'NHS_APP',
          message: 'new-message',
        };

        const template: TemplateDto = {
          ...data,
          id: templateId,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lockNumber: 11,
        };

        mocks.templateRepository.update.mockResolvedValueOnce({
          data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
        });

        const result = await templateClient.updateTemplate(
          templateId,
          data,
          user,
          '10'
        );

        expect(result).toEqual({ data: template });

        expect(mocks.templateRepository.update).toHaveBeenCalledWith(
          templateId,
          data,
          user,
          'NOT_YET_SUBMITTED',
          10
        );
      });
    });

    test('updateTemplate should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateUpdateTemplate = {
        name: 'name',
        message: 'message',
        templateType: 'SMS',
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        user,
        1
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
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
        lockNumber: 2,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.updateTemplate(
        templateId,
        data,
        user,
        1
      );

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        templateId,
        data,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
        },
      });
    });
  });

  describe('patchTemplate', () => {
    test('should return patched template', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        name: 'Updated Template Name',
      };

      const template: TemplateDto = {
        id: templateId,
        name: 'Updated Template Name',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x1',
        language: 'en',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: {
            fileName: 'render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 1,
          },
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PENDING',
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockNumber: 6,
      };

      mocks.templateRepository.patch.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        data: template,
      });
    });

    test('should return a failure result, when patch data is invalid', async () => {
      const { templateClient } = setup();

      const updates = {
        name: '',
      };

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
          }),
        }),
      });
    });

    test('should return a failure result when no fields are provided', async () => {
      const { templateClient } = setup();

      const updates = {};

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: expect.objectContaining({
            code: 400,
            description: 'Request failed validation',
          }),
        }),
      });
    });

    describe('lock number parsing', () => {
      const errorCases: [string, string | number][] = [
        ['empty', ''],
        ['negative', -1],
        ['negative stringified', -1],
        ['non-number string', 'a'],
        ['NaN', Number.NaN],
        ['NaN stringified', 'NaN'],
      ];
      test.each(errorCases)(
        'should return a failure result when lockNumber is invalid: %s',
        async (_, lockNumber) => {
          const { templateClient } = setup();

          const updates = {
            name: 'Updated Name',
          };

          const result = await templateClient.patchTemplate(
            templateId,
            updates,
            user,
            lockNumber
          );

          expect(result).toEqual({
            error: expect.objectContaining({
              errorMeta: {
                code: 400,
                description: 'Invalid lock number provided',
              },
            }),
          });
        }
      );

      test('coerces stringified lock number to number', async () => {
        const { templateClient, mocks } = setup();

        const updates = {
          name: 'Updated Name',
        };

        const template: TemplateDto = {
          id: templateId,
          name: 'Updated Name',
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
          letterType: 'x1',
          language: 'en',
          letterVersion: 'AUTHORING',
          files: {
            initialRender: {
              fileName: 'render.pdf',
              currentVersion: 'v1',
              status: 'RENDERED',
              pageCount: 1,
            },
            docxTemplate: {
              currentVersion: 'version-id',
              fileName: 'template.docx',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lockNumber: 11,
        };

        mocks.templateRepository.patch.mockResolvedValueOnce({
          data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
        });

        const result = await templateClient.patchTemplate(
          templateId,
          updates,
          user,
          '10'
        );

        expect(result).toEqual({ data: template });

        expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
          templateId,
          updates,
          user,
          10
        );
      });
    });

    test('should return a failure result when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        name: 'Updated Name',
      };

      mocks.templateRepository.patch.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });
    });

    test('should return a failure result when patched database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        name: 'Updated Name',
      };

      const expectedTemplateDto: TemplateDto = {
        id: templateId,
        name: 'Updated Name',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x1',
        language: 'en',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: {
            fileName: 'initial-render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 1,
          },
        },
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        lockNumber: 6,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.templateRepository.patch.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
        },
      });
    });

    test('should return a failure result when fetching client configuration fails during campaignId update', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        campaignId: 'campaign-id',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(
        user.clientId
      );

      expect(result).toEqual({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      expect(mocks.templateRepository.patch).not.toHaveBeenCalled();
    });

    test('should return a failure result if campaign ID is not valid during patch', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        campaignId: 'campaign-id',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: {}, campaignIds: ['fish-campaign'] },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(
        user.clientId
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            description: 'Invalid campaign ID in request',
            code: 400,
          },
        },
      });

      expect(mocks.templateRepository.patch).not.toHaveBeenCalled();
    });

    test('should successfully patch when campaign ID is valid', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        campaignId: 'campaign-id',
      };

      const template: TemplateDto = {
        id: templateId,
        name: 'Template Name',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x1',
        language: 'en',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: {
            fileName: 'render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 1,
          },
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
        },
        campaignId: 'campaign-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockNumber: 6,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: {},
          campaignIds: ['campaign-id', 'bean-campaign', 'pea-campaign'],
        },
      });

      mocks.templateRepository.patch.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(
        user.clientId
      );

      expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
        templateId,
        updates,
        user,
        5
      );

      expect(result).toEqual({
        data: template,
      });
    });

    test('should not fetch client configuration when campaignId is not in updates', async () => {
      const { templateClient, mocks } = setup();

      const updates = {
        name: 'Updated Name',
      };

      const template: TemplateDto = {
        id: templateId,
        name: 'Updated Name',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x1',
        language: 'en',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: {
            fileName: 'render.pdf',
            currentVersion: 'v1',
            status: 'RENDERED',
            pageCount: 1,
          },
          docxTemplate: {
            currentVersion: 'version-id',
            fileName: 'template.docx',
            virusScanStatus: 'PASSED',
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockNumber: 6,
      };

      mocks.templateRepository.patch.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const result = await templateClient.patchTemplate(
        templateId,
        updates,
        user,
        5
      );

      expect(mocks.clientConfigRepository.get).not.toHaveBeenCalled();

      expect(mocks.templateRepository.patch).toHaveBeenCalledWith(
        templateId,
        updates,
        user,
        5
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
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.getTemplate(templateId, user);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        user.clientId
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
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
        lockNumber: 1,
      };

      const template: DatabaseTemplate = {
        ...templateDTO,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.getTemplate(templateId, user);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        user.clientId
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
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
        lockNumber: 1,
      };

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const result = await templateClient.getTemplate(templateId, user);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        user.clientId
      );

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('listTemplates', () => {
    test('listTemplates should return a failure result, when fetching from the database unexpectedly fails', async () => {
      const {
        templateClient,
        mocks: { templateRepository, queryMock },
      } = setup();

      templateRepository.query.mockReturnValueOnce(queryMock);
      queryMock.list.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.listTemplates(user);

      expect(templateRepository.query).toHaveBeenCalledWith(user.clientId);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });
    });

    test('should return templates', async () => {
      const {
        templateClient,
        mocks: { templateRepository, queryMock },
      } = setup();

      const template: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
        lockNumber: 1,
      };

      templateRepository.query.mockReturnValueOnce(queryMock);

      queryMock.list.mockResolvedValueOnce({
        data: [template],
      });

      const result = await templateClient.listTemplates(user, null);

      expect(templateRepository.query).toHaveBeenCalledWith(user.clientId);
      expect(queryMock.excludeTemplateStatus).toHaveBeenCalledWith('DELETED');
      expect(queryMock.templateStatus).not.toHaveBeenCalled();
      expect(queryMock.templateType).not.toHaveBeenCalled();
      expect(queryMock.language).not.toHaveBeenCalled();
      expect(queryMock.letterType).not.toHaveBeenCalled();

      expect(result).toEqual({
        data: [template],
      });
    });

    it('validates status filter parameter', async () => {
      const { templateClient, mocks } = setup();

      const result = await templateClient.listTemplates(user, {
        templateType: 'INVALID',
      });

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              templateType:
                'Invalid option: expected one of "NHS_APP"|"EMAIL"|"SMS"|"LETTER"',
            },
          },
        }),
      });

      expect(mocks.templateRepository.query).not.toHaveBeenCalled();
    });

    test('uses filters', async () => {
      const {
        templateClient,
        mocks: { templateRepository, queryMock },
      } = setup();

      const filter: TemplateFilter = {
        templateStatus: ['SUBMITTED'],
        templateType: 'NHS_APP',
        language: 'en',
        excludeLanguage: 'fr',
        letterType: 'x0',
      };

      const template: TemplateDto = {
        id: templateId,
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
        lockNumber: 1,
      };

      templateRepository.query.mockReturnValueOnce(queryMock);

      queryMock.list.mockResolvedValueOnce({
        data: [template],
      });

      const result = await templateClient.listTemplates(user, filter);

      expect(templateRepository.query).toHaveBeenCalledWith(user.clientId);
      expect(queryMock.excludeTemplateStatus).toHaveBeenCalledWith('DELETED');
      expect(queryMock.templateStatus).toHaveBeenCalledWith('SUBMITTED');
      expect(queryMock.templateType).toHaveBeenCalledWith('NHS_APP');
      expect(queryMock.language).toHaveBeenCalledWith('en');
      expect(queryMock.excludeLanguage).toHaveBeenCalledWith('fr');
      expect(queryMock.letterType).toHaveBeenCalledWith('x0');

      expect(result).toEqual({
        data: [template],
      });
    });

    describe('templateStatus array parameter spreading', () => {
      test('should spread multiple templateStatus values as separate arguments', async () => {
        const {
          templateClient,
          mocks: { templateRepository, queryMock },
        } = setup();

        const filter: TemplateFilter = {
          templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
        };

        const template: Extract<TemplateDto, { templateType: 'LETTER' }> = {
          id: templateId,
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
          letterVersion: 'PDF',
          files: {} as PdfLetterFiles,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: 'SUBMITTED',
          lockNumber: 1,
        };

        templateRepository.query.mockReturnValueOnce(queryMock);
        queryMock.list.mockResolvedValueOnce({
          data: [template],
        });

        const result = await templateClient.listTemplates(user, filter);

        expect(queryMock.templateStatus).toHaveBeenCalledWith(
          'SUBMITTED',
          'PROOF_APPROVED'
        );
        expect(result).toEqual({
          data: [template],
        });
      });

      test('should spread single-element templateStatus array correctly', async () => {
        const {
          templateClient,
          mocks: { templateRepository, queryMock },
        } = setup();

        const filter = {
          templateStatus: ['SUBMITTED'],
        } as TemplateFilter;

        const template: Extract<TemplateDto, { templateType: 'LETTER' }> = {
          id: templateId,
          templateType: 'LETTER',
          name: 'name',
          language: 'en',
          letterType: 'x0',
          letterVersion: 'PDF',
          files: {} as PdfLetterFiles,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: 'SUBMITTED',
          lockNumber: 1,
        };

        templateRepository.query.mockReturnValueOnce(queryMock);
        queryMock.list.mockResolvedValueOnce({
          data: [template],
        });

        await templateClient.listTemplates(user, filter);

        expect(queryMock.templateStatus).toHaveBeenCalledWith('SUBMITTED');
      });
    });
  });

  describe('submitTemplate', () => {
    const notYetSubmittedDto: TemplateDto = {
      id: templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      templateType: 'SMS',
      lockNumber: 1,
    };

    test('returns failure result when lock number is invalid', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValue({
        data: { features: { routing: false } },
      });

      const result = await templateClient.submitTemplate(templateId, user, '');

      expect(mocks.templateRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Invalid lock number provided',
          },
        },
      });
    });

    test('submitTemplate should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false } },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          ...notYetSubmittedDto,
          owner: user.internalUserId,
          version: 1,
        },
      });

      mocks.templateRepository.submit.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.submitTemplate(templateId, user, 0);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        user,
        0
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });
    });

    test('submitTemplate should return a failure result, when updated database template is invalid', async () => {
      const { templateClient, mocks } = setup();

      const template: DatabaseTemplate = {
        ...notYetSubmittedDto,
        createdAt: undefined as unknown as string,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false } },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          ...notYetSubmittedDto,
          owner: user.internalUserId,
          version: 1,
        },
      });

      mocks.templateRepository.submit.mockResolvedValueOnce({
        data: template,
      });

      const result = await templateClient.submitTemplate(templateId, user, 0);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        user,
        0
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Error retrieving template',
          },
        },
      });
    });

    test('submitTemplate should return template updated to SUBMITTED - routing is disabled', async () => {
      const { templateClient, mocks } = setup();

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          ...notYetSubmittedDto,
          owner: `CLIENT#${user.clientId}`,
          version: 1,
        },
      });

      mocks.templateRepository.submit.mockResolvedValueOnce({
        data: {
          ...notYetSubmittedDto,
          owner: user.internalUserId,
          version: 1,
        },
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false } },
      });

      const result = await templateClient.submitTemplate(templateId, user, 0);

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        user,
        0
      );

      expect(result).toEqual({
        data: notYetSubmittedDto,
      });
    });

    test('should return validation failure when routing is enabled for non-letter template', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true } },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          ...notYetSubmittedDto,
          templateType: 'SMS',
          owner: user.internalUserId,
          version: 1,
        },
      });

      const result = await templateClient.submitTemplate(templateId, user, 0);

      expect(mocks.templateRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Unexpected non-letter',
          },
        },
      });
    });

    test('should set LETTER template status to proof approved if routing is enabled', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        name: 'name',
        templateType: 'LETTER',
        templateStatus: 'PROOF_AVAILABLE',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockNumber: 1,
        language: 'en',
        letterType: 'x0',
        letterVersion: 'PDF',
        campaignId: 'campaign-id',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: 'v1',
            virusScanStatus: 'PASSED',
          },
        },
      };

      const approvedTemplate: TemplateDto = {
        ...template,
        templateStatus: 'PROOF_APPROVED',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true } },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: { ...template, owner: user.internalUserId, version: 1 },
      });

      mocks.templateRepository.approveProof.mockResolvedValueOnce({
        data: { ...approvedTemplate, owner: user.internalUserId, version: 2 },
      });

      const result = await templateClient.submitTemplate(templateId, user, 1);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        user.clientId
      );

      expect(mocks.templateRepository.approveProof).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        data: approvedTemplate,
      });
    });

    test('should set LETTER template status to submitted if routing is not enabled', async () => {
      const { templateClient, mocks } = setup();

      const template: TemplateDto = {
        name: 'name',
        templateType: 'LETTER',
        templateStatus: 'PROOF_AVAILABLE',
        id: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockNumber: 1,
        language: 'en',
        letterType: 'x0',
        letterVersion: 'PDF',
        campaignId: 'campaign-id',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: 'v1',
            virusScanStatus: 'PASSED',
          },
        },
      };

      const submittedTemplate: TemplateDto = {
        ...template,
        templateStatus: 'SUBMITTED',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: {} },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: { ...template, owner: user.internalUserId, version: 1 },
      });

      mocks.templateRepository.submit.mockResolvedValueOnce({
        data: { ...submittedTemplate, owner: user.internalUserId, version: 2 },
      });

      const result = await templateClient.submitTemplate(templateId, user, 1);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(
        templateId,
        user.clientId
      );

      expect(mocks.templateRepository.submit).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        data: submittedTemplate,
      });
    });

    test('should return a failure result when fetching client configuration fails', async () => {
      const { templateClient, mocks } = setup();

      const clientConfigError = {
        actualError: new Error('config fetch error'),
        errorMeta: {
          code: 500,
          description: 'Failed to fetch client configuration',
        },
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: clientConfigError,
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          id: templateId,
          templateType: 'SMS',
          name: 'name',
          message: 'message',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: 'NOT_YET_SUBMITTED',
          lockNumber: 1,
          owner: `CLIENT#${user.clientId}`,
          version: 1,
        },
      });

      const result = await templateClient.submitTemplate(templateId, user, 1);

      expect(mocks.templateRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: clientConfigError,
      });
    });

    test('should return a failure result when fetching template fails', async () => {
      const { templateClient, mocks } = setup();

      const templateError = {
        actualError: new Error('template fetch error'),
        errorMeta: {
          code: 500,
          description: 'Failed to fetch template',
        },
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false } },
      });

      mocks.templateRepository.get.mockResolvedValueOnce({
        error: templateError,
      });

      const result = await templateClient.submitTemplate(templateId, user, 1);

      expect(mocks.templateRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: templateError,
      });
    });
  });

  describe('requestProof', () => {
    test('returns failure result when lock number is invalid', async () => {
      const { templateClient, mocks } = setup();

      const result = await templateClient.requestProof(templateId, user, '');

      expect(
        mocks.templateRepository.proofRequestUpdate
      ).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Invalid lock number provided',
          },
        },
      });
    });

    test('should return a failure result, when proofing is disabled', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { proofing: false } },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(
        mocks.templateRepository.proofRequestUpdate
      ).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 403,
            description: 'User cannot request a proof',
          },
        },
      });
    });

    test('should return a failure result when fetching client configuration unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: { errorMeta: { description: 'err', code: 500 } },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(
        mocks.templateRepository.proofRequestUpdate
      ).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'err',
          },
        },
      });
    });

    test('requestProof should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks, logMessages } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { proofing: true }, campaignIds: ['campaignId'] },
      });

      const actualError = new Error('from db');

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        error: {
          actualError,
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaignId'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        error: {
          actualError,
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      expect(logMessages).toContainEqual({
        code: 500,
        user,
        description: 'Internal server error',
        level: 'error',
        message: 'from db',
        stack: expect.any(String),
        templateId,
        timestamp: expect.stringMatching(isoDateRegExp),
      });
    });

    test('should return a failure result, when updated database template is not suitable for proofing', async () => {
      const { templateClient, mocks } = setup();

      const expectedTemplateDto: TemplateDto = {
        id: templateId,
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'SUBMITTED',
        name: 'name',
        message: 'message',
        templateType: 'SMS',
        lockNumber: 1,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: template,
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaignId'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Malformed template',
          },
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
        lockNumber: 1,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: `CLIENT#${user.clientId}`,
        version: 1,
      };

      // This is not actually possible, because the update is conditional on
      // templateType being LETTER
      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: template,
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaignId'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Malformed template',
          },
        },
      });
    });

    test('should return a failure result, when failing to send to SQS', async () => {
      const { templateClient, mocks } = setup();

      const pdfVersionId = 'a';
      const personalisationParameters = ['myParam'];

      const template: TemplateDto = {
        campaignId: 'campaign-id-from-template',
        createdAt: new Date().toISOString(),
        files: {
          pdfTemplate: {
            virusScanStatus: 'PASSED',
            currentVersion: pdfVersionId,
            fileName: 'template.pdf',
          },
        },
        id: templateId,
        language: 'en',
        letterType: 'x1',
        letterVersion: 'PDF',
        name: templateName,
        personalisationParameters,
        templateStatus: 'SUBMITTED',
        templateType: 'LETTER',
        updatedAt: new Date().toISOString(),
        lockNumber: 1,
      };

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      const clientErr = new Error('sqs err');

      mocks.queueMock.send.mockResolvedValueOnce({
        error: {
          actualError: clientErr,
          errorMeta: {
            description: 'Failed to send to proofing queue',
            code: 500,
          },
        },
      });

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-id-from-ssm'],
          features: {
            proofing: true,
          },
        },
      });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(mocks.queueMock.send).toHaveBeenCalledTimes(1);
      expect(mocks.queueMock.send).toHaveBeenCalledWith(
        templateId,
        templateName,
        user,
        'campaign-id-from-template',
        personalisationParameters,
        'x1',
        'en',
        pdfVersionId,
        undefined,
        defaultLetterSupplier
      );

      expect(result).toEqual({
        error: {
          actualError: clientErr,
          errorMeta: {
            code: 500,
            description: 'Failed to send to proofing queue',
          },
        },
      });
    });

    test('requestProof should return updated template', async () => {
      const { templateClient, mocks } = setup();

      const pdfVersionId = 'a';
      const personalisationParameters = ['myParam'];
      const campaignFromTemplate = 'campaign-from-template';

      const template: TemplateDto = {
        campaignId: campaignFromTemplate,
        createdAt: new Date().toISOString(),
        files: {
          pdfTemplate: {
            virusScanStatus: 'PASSED',
            currentVersion: pdfVersionId,
            fileName: 'template.pdf',
          },
        },
        id: templateId,
        language: 'en',
        letterType: 'x1',
        letterVersion: 'PDF',
        name: templateName,
        personalisationParameters,
        templateStatus: 'SUBMITTED',
        templateType: 'LETTER',
        updatedAt: new Date().toISOString(),
        lockNumber: 1,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          campaignIds: ['campaign-from-ssm'],
          features: {
            proofing: true,
          },
        },
      });

      mocks.templateRepository.proofRequestUpdate.mockResolvedValueOnce({
        data: { ...template, owner: `CLIENT#${user.clientId}`, version: 1 },
      });

      mocks.queueMock.send.mockResolvedValueOnce({ data: { $metadata: {} } });

      const result = await templateClient.requestProof(templateId, user, 1);

      expect(mocks.templateRepository.proofRequestUpdate).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(mocks.queueMock.send).toHaveBeenCalledTimes(1);
      expect(mocks.queueMock.send).toHaveBeenCalledWith(
        templateId,
        templateName,
        user,
        campaignFromTemplate,
        personalisationParameters,
        'x1',
        'en',
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
    test('should return nothing when successful (and no routing configs linked)', async () => {
      const { templateClient, mocks } = setup();

      mocks.routingConfigRepository.getByTemplateId.mockResolvedValueOnce({
        data: [],
      });

      mocks.templateRepository.delete.mockResolvedValueOnce({
        data: null,
      });

      const result = await templateClient.deleteTemplate(templateId, user, 1);

      expect(
        mocks.routingConfigRepository.getByTemplateId
      ).toHaveBeenCalledWith(templateId, user.clientId);

      expect(mocks.templateRepository.delete).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        data: undefined,
      });
    });

    test('should return TEMPLATE_IN_USE error when routing configs reference the template', async () => {
      const { templateClient, mocks, logMessages } = setup();

      mocks.routingConfigRepository.getByTemplateId.mockResolvedValueOnce({
        data: [
          {
            id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
            name: 'Message Plan 1',
          },
          {
            id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10',
            name: 'Message Plan 2',
          },
        ],
      });

      const result = await templateClient.deleteTemplate(templateId, user, 1);

      expect(
        mocks.routingConfigRepository.getByTemplateId
      ).toHaveBeenCalledWith(templateId, user.clientId);

      expect(mocks.templateRepository.delete).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: {
            code: 400,
            description:
              'Template is linked to active message plans and cannot be deleted',
            details: {
              errorCode: 'TEMPLATE_IN_USE',
            },
          },
        }),
      });

      expect(logMessages).toContainEqual({
        level: 'error',
        message: 'Template is linked to routing configs',
        routingConfigs: [
          {
            id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
            name: 'Message Plan 1',
          },
          {
            id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10',
            name: 'Message Plan 2',
          },
        ],
        templateId,
        timestamp: expect.stringMatching(isoDateRegExp),
        user,
      });
    });

    test('should return error when routing config reference check fails', async () => {
      const { templateClient, mocks, logMessages } = setup();

      const actualError = new Error('Database error');

      mocks.routingConfigRepository.getByTemplateId.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Failed to get routing configs by template',
          },
          actualError,
        },
      });

      const result = await templateClient.deleteTemplate(templateId, user, 1);

      expect(
        mocks.routingConfigRepository.getByTemplateId
      ).toHaveBeenCalledWith(templateId, user.clientId);

      expect(mocks.templateRepository.delete).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Failed to get routing configs by template',
          },
          actualError,
        },
      });

      expect(logMessages).toContainEqual({
        code: 500,
        description: 'Failed to get routing configs by template',
        level: 'error',
        message: 'Failed to check routing config links Database error',
        stack: expect.any(String),
        templateId,
        timestamp: expect.stringMatching(isoDateRegExp),
        user,
      });
    });

    describe('lock number parsing', () => {
      const errorCases: [string, string | number][] = [
        ['empty', ''],
        ['negative', -1],
        ['negative stringified', -1],
        ['non-number string', 'a'],
        ['NaN', Number.NaN],
        ['NaN stringified', 'NaN'],
      ];
      test.each(errorCases)(
        'should return a failure result when lockNumber is invalid: %s',
        async (_, lockNumber) => {
          const { templateClient } = setup();

          const result = await templateClient.deleteTemplate(
            templateId,
            user,
            lockNumber
          );

          expect(result).toEqual({
            error: expect.objectContaining({
              errorMeta: {
                code: 400,
                description: 'Invalid lock number provided',
              },
            }),
          });
        }
      );

      test('coerces stringified lock number to number', async () => {
        const { templateClient, mocks } = setup();

        mocks.routingConfigRepository.getByTemplateId.mockResolvedValueOnce({
          data: [],
        });

        mocks.templateRepository.delete.mockResolvedValueOnce({
          data: null,
        });

        await templateClient.deleteTemplate(templateId, user, '10');

        expect(
          mocks.routingConfigRepository.getByTemplateId
        ).toHaveBeenCalledWith(templateId, user.clientId);

        expect(mocks.templateRepository.delete).toHaveBeenCalledWith(
          templateId,
          user,
          10
        );
      });
    });

    test('deleteTemplate should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      mocks.routingConfigRepository.getByTemplateId.mockResolvedValueOnce({
        data: [],
      });

      mocks.templateRepository.delete.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });

      const result = await templateClient.deleteTemplate(templateId, user, 1);

      expect(
        mocks.routingConfigRepository.getByTemplateId
      ).toHaveBeenCalledWith(templateId, user.clientId);

      expect(mocks.templateRepository.delete).toHaveBeenCalledWith(
        templateId,
        user,
        1
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'Internal server error',
          },
        },
      });
    });
  });

  describe('getClientConfiguration', () => {
    const clientId = 'client1';
    const internalUserId = 'user1';

    test('should return a 404 failure result, when client configuration is not available for client', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({ data: null });

      const result = await templateClient.getClientConfiguration({
        clientId,
        internalUserId,
      });

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(clientId);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Client configuration is not available',
          },
        },
      });
    });

    test('should return a failure result, when client configuration unexpectedly cannot be fetched', async () => {
      const { templateClient, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: { errorMeta: { description: 'fetch failure', code: 500 } },
      });

      const result = await templateClient.getClientConfiguration({
        clientId,
        internalUserId,
      });

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'fetch failure',
          },
        },
      });
    });

    test('should return client configuration', async () => {
      const { templateClient, mocks } = setup();

      const client: ClientConfiguration = {
        features: { proofing: true },
        campaignIds: ['campaign'],
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({ data: client });

      const result = await templateClient.getClientConfiguration({
        clientId,
        internalUserId,
      });

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(clientId);

      expect(result).toEqual({
        data: client,
      });
    });
  });
});
