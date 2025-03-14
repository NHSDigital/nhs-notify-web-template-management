import {
  CreateTemplate,
  TemplateDto,
  UpdateTemplate,
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
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
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
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
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
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

    test('should return a failure result, when created database template is invalid', async () => {
      const data: CreateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: 'id',
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
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
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return created template', async () => {
      const data: CreateTemplate = {
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: 'id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
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
        data: expectedTemplateDto,
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
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
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
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
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

    test('should return a failure result, when updated database template is invalid', async () => {
      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const expectedTemplateDto: TemplateDto = {
        ...data,
        id: 'id',
        createdAt: undefined as unknown as string,
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
      };

      const template: DatabaseTemplate = {
        ...expectedTemplateDto,
        owner: 'owner',
        version: 1,
      };

      validateMock.mockResolvedValueOnce({
        data,
      });

      updateMock.mockResolvedValueOnce({
        data: template,
      });

      const result = await client.updateTemplate('id', data);

      expect(updateMock).toHaveBeenCalledWith('id', data, 'owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return updated template', async () => {
      const data: UpdateTemplate = {
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'SMS',
      };

      const template: TemplateDto = {
        ...data,
        id: 'id',
        templateType: 'SMS',
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

    test('should return a failure result, when database template is invalid', async () => {
      const templateDTO: TemplateDto = {
        id: 'id',
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
        owner: 'owner',
        version: 1,
      };

      getMock.mockResolvedValueOnce({
        data: template,
      });

      const result = await client.getTemplate('id');

      expect(getMock).toHaveBeenCalledWith('id', 'owner');

      expect(result).toEqual({
        error: {
          code: 500,
          message: 'Error retrieving template',
        },
      });
    });

    test('should return a failure result, when fetching a letter, if letter flag is not enabled', async () => {
      const noLettersClient = new TemplateClient('owner', false);

      getMock.mockResolvedValueOnce({
        data: {
          id: 'id',
          templateType: 'LETTER',
          name: 'name',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateStatus: 'NOT_YET_SUBMITTED',
          letterType: 'q4',
          language: 'fr',
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
      const template: TemplateDto = {
        id: 'id',
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
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

      const template: TemplateDto = {
        id: 'id',
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

      listMock.mockResolvedValueOnce({
        data: [{ ...template, owner: 'owner', version: 1 }],
      });

      const result = await noLettersClient.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [],
      });
    });

    test('should filter out invalid templates', async () => {
      const template: TemplateDto = {
        id: 'id',
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

      listMock.mockResolvedValueOnce({
        data: [
          { ...template, owner: 'owner', version: 1 },
          { ...template2, owner: 'owner', version: 1 },
        ],
      });

      const result = await client.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [template],
      });
    });

    test('should return templates', async () => {
      const template: TemplateDto = {
        id: 'id',
        templateType: 'EMAIL',
        name: 'name',
        message: 'message',
        subject: 'subject',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateStatus: 'NOT_YET_SUBMITTED',
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
