import {
  CreateTemplate,
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  Language,
  LetterType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';
import {
  DatabaseTemplate,
  templateRepository,
} from '@backend-api/templates/infra';
import { validate } from '@backend-api/utils/validate';
import { TemplateClient } from '@backend-api/templates/app/template-client';

jest.mock('@backend-api/templates/infra');
jest.mock('@backend-api/utils/validate');

const createMock = jest.mocked(templateRepository.create);
const updateMock = jest.mocked(templateRepository.update);
const getMock = jest.mocked(templateRepository.get);
const listMock = jest.mocked(templateRepository.list);
const validateMock = jest.mocked(validate);

// letters feature flag is enabled
const client = new TemplateClient('owner', true);

describe('templateClient', () => {
  beforeEach(jest.resetAllMocks);

  describe('createTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      validateMock.mockResolvedValueOnce({
        error: {
          code: 400,
          message: 'Bad request',
        },
      });

      const data: CreateTemplate = {
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
      };

      const result = await client.createTemplate(data);

      expect(validateMock).toHaveBeenCalledWith($CreateTemplateSchema, data);

      expect(result).toEqual({
        error: {
          code: 400,
          message: 'Bad request',
        },
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const data: CreateTemplate = {
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
      };

      validateMock.mockResolvedValueOnce({
        data,
      });

      createMock.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await client.createTemplate(data);

      expect(createMock).toHaveBeenCalledWith(data, 'owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return created template', async () => {
      const data: CreateTemplate = {
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
      };

      const expectedTemplateDTO: TemplateDTO = {
        ...data,
        id: 'id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDTO,
        owner: 'owner',
        version: 1,
      };

      validateMock.mockResolvedValueOnce({
        data,
      });

      createMock.mockResolvedValueOnce({
        data: template,
      });

      const result = await client.createTemplate(data);

      expect(createMock).toHaveBeenCalledWith(data, 'owner');

      expect(result).toEqual({
        data: expectedTemplateDTO,
      });
    });
  });

  describe('updateTemplate', () => {
    test('should return a failure result, when template data is invalid', async () => {
      validateMock.mockResolvedValueOnce({
        error: {
          code: 400,
          message: 'Bad request',
        },
      });

      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        templateType: TemplateType.SMS,
      };

      const result = await client.updateTemplate('id', data);

      expect(validateMock).toHaveBeenCalledWith($UpdateTemplateSchema, data);

      expect(result).toEqual({
        error: {
          code: 400,
          message: 'Bad request',
        },
      });
    });

    test('should return a failure result, when saving to the database unexpectedly fails', async () => {
      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        templateType: TemplateType.SMS,
      };

      validateMock.mockResolvedValueOnce({
        data,
      });

      updateMock.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await client.updateTemplate('id', data);

      expect(updateMock).toHaveBeenCalledWith('id', data, 'owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return updated template', async () => {
      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        templateType: TemplateType.SMS,
      };

      const template: TemplateDTO = {
        ...data,
        id: 'id',
        templateType: TemplateType.SMS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      validateMock.mockResolvedValueOnce({
        data,
      });

      updateMock.mockResolvedValueOnce({
        data: { ...template, owner: 'owner', version: 1 },
      });

      const result = await client.updateTemplate('id', data);

      expect(updateMock).toHaveBeenCalledWith('id', data, 'owner');

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('getTemplate', () => {
    test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
      getMock.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await client.getTemplate('id');

      expect(getMock).toHaveBeenCalledWith('id', 'owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('should return a failure result, when fetching a letter, if letter flag is not enabled', async () => {
      const noLettersClient = new TemplateClient('owner', false);

      getMock.mockResolvedValueOnce({
        data: {
          id: 'id',
          templateType: TemplateType.LETTER,
          name: 'name',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
          letterType: LetterType.Q4,
          language: Language.FR,
          pdfTemplateInputFile: 'file.pdf',
          testPersonalisationInputFile: 'file.csv',
          owner: 'owner',
          version: 1,
        },
      });

      const result = await noLettersClient.getTemplate('id');

      expect(getMock).toHaveBeenCalledWith('id', 'owner');

      expect(result).toEqual({
        error: {
          code: 404,
          message: 'Template not found',
        },
      });
    });

    test('should return template', async () => {
      const template: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      getMock.mockResolvedValueOnce({
        data: { ...template, owner: 'owner', version: 1 },
      });

      const result = await client.getTemplate('id');

      expect(getMock).toHaveBeenCalledWith('id', 'owner');

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('listTemplates', () => {
    test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
      listMock.mockResolvedValueOnce({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });

      const result = await client.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Internal server error',
        },
      });
    });

    test('filters out letters if the feature flag is not enabled', async () => {
      const noLettersClient = new TemplateClient('owner', false);

      const template: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.LETTER,
        name: 'name',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        letterType: LetterType.Q4,
        language: Language.FR,
        files: {
          pdfTemplate: {
            fileName: 'file.pdf',
            currentVersion: 'uuid',
            virusScanStatus: VirusScanStatus.PENDING,
          },
          testDataCsv: {
            fileName: 'file.csv',
            currentVersion: 'uuid',
            virusScanStatus: VirusScanStatus.PENDING,
          },
        },
      };

      listMock.mockResolvedValueOnce({
        data: [{ ...template, owner: 'owner', version: 1 }],
      });

      const result = await noLettersClient.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [],
      });
    });

    test('should return templates', async () => {
      const template: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      listMock.mockResolvedValueOnce({
        data: [{ ...template, owner: 'owner', version: 1 }],
      });

      const result = await client.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [template],
      });
    });
  });
});
