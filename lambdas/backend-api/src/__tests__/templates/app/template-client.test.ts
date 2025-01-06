import {
  CreateTemplate,
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import {
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  DatabaseTemplate,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { validate } from '@backend-api/utils/validate';
import { TemplateClient } from '@backend-api/templates/app/template-client';

jest.mock('@backend-api/templates/domain/template/template-repository');
jest.mock('@backend-api/utils/validate');

const createMock = jest.mocked(templateRepository.create);
const updateMock = jest.mocked(templateRepository.update);
const getMock = jest.mocked(templateRepository.get);
const listMock = jest.mocked(templateRepository.list);
const validateMock = jest.mocked(validate);

const client = new TemplateClient('owner');

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

    test('should return filtered sorted templates', async () => {
      const template1: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date('2022-01-01 09:00').toISOString(),
        updatedAt: new Date('2022-01-01 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      const template2: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date('2022-01-02 09:00').toISOString(),
        updatedAt: new Date('2022-01-02 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      const template3: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date('2022-01-03 09:00').toISOString(),
        updatedAt: new Date('2022-01-03 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      const invalidTemplate: TemplateDTO = {
        id: 'id',
        templateType: TemplateType.EMAIL,
        createdAt: new Date('2022-01-03 09:00').toISOString(),
        updatedAt: new Date('2022-01-03 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      } as unknown as TemplateDTO;

      listMock.mockResolvedValueOnce({
        data: [template2, invalidTemplate, template1, template3].map(template => ({ ...template, owner: 'owner', version: 1 })), // unsorted
      });

      const result = await client.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [template3, template2, template1], // sorted
      });
    });

    test('should sort templates on id if created date is equal', async () => {
      const template1: TemplateDTO = {
        id: 'id1',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date('2022-01-01 09:00').toISOString(),
        updatedAt: new Date('2022-01-01 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      const template2: TemplateDTO = {
        id: 'id2',
        templateType: TemplateType.EMAIL,
        name: 'name',
        message: 'message',
        createdAt: new Date('2022-01-01 09:00').toISOString(),
        updatedAt: new Date('2022-01-01 09:00').toISOString(),
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      };

      listMock.mockResolvedValueOnce({
        data: [template2, template1].map(template => ({ ...template, owner: 'owner', version: 1 })), // unsorted
      });

      const result = await client.listTemplates();

      expect(listMock).toHaveBeenCalledWith('owner');

      expect(result).toEqual({
        data: [template1, template2], // sorted
      });
    });
  });
});
