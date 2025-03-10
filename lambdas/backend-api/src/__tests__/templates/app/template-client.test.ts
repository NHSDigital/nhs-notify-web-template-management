import {
  CreateTemplate,
  TemplateDto,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import {
  DatabaseTemplate,
  TemplateRepository,
} from '@backend-api/templates/infra';
import { TemplateClient } from '@backend-api/templates/app/template-client';
import { mock } from 'jest-mock-extended';
import { LetterUploadRepository } from '@backend-api/templates/infra/letter-upload-repository';

const owner = '58890285E473';
const id = 'E1F5088E5B77';

const setup = () => {
  const enableLetters = true;

  const templateRepository = mock<TemplateRepository>();

  const letterUploadRepository = mock<LetterUploadRepository>();

  const generateId = () => id;

  const templateClient = new TemplateClient(
    enableLetters,
    templateRepository,
    letterUploadRepository,
    generateId
  );

  return {
    templateClient,
    mocks: { templateRepository, letterUploadRepository, generateId },
  };
};

describe('templateClient', () => {
  beforeEach(jest.resetAllMocks);

  describe('createTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient } = setup();

      const data = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const result = await templateClient.createTemplate(
        data as unknown as CreateTemplate,
        owner
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
        }),
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const data: CreateTemplate = {
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

      const data: CreateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id,
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

      const data: CreateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id,
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

  describe('updateTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      const { templateClient } = setup();

      const data = {
        name: 'name',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const result = await templateClient.updateTemplate(
        id,
        data as unknown as UpdateTemplate,
        owner
      );

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: 'Request failed validation',
        }),
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const { templateClient, mocks } = setup();

      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await templateClient.updateTemplate(id, data, owner);

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        id,
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

      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id,
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

      const result = await templateClient.updateTemplate(id, data, owner);

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        id,
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

      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const template: TemplateDto = {
        ...data,
        id,
        templateType: 'SMS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mocks.templateRepository.update.mockResolvedValueOnce({
        data: { ...template, owner, version: 1 },
      });

      const result = await templateClient.updateTemplate(id, data, owner);

      expect(mocks.templateRepository.update).toHaveBeenCalledWith(
        id,
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

      const result = await templateClient.getTemplate(id, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(id, owner);

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
        id: id,
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

      const result = await templateClient.getTemplate(id, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(id, owner);

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
        mocks.generateId
      );

      mocks.templateRepository.get.mockResolvedValueOnce({
        data: {
          id: id,
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

      const result = await noLettersClient.getTemplate(id, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(id, owner);

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
        id: id,
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

      const result = await templateClient.getTemplate(id, owner);

      expect(mocks.templateRepository.get).toHaveBeenCalledWith(id, owner);

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
        mocks.generateId
      );

      const template: TemplateDto = {
        id: id,
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
        id: id,
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
        id: id,
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
});
