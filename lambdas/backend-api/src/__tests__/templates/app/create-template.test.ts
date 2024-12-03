import {
  CreateTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  $CreateTemplateSchema,
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { createTemplate } from '@backend-api/templates/app/create-template';
import { validate } from '@backend-api/utils/validate';

jest.mock('@backend-api/templates/domain/template/template-repository');
jest.mock('@backend-api/templates/domain/user');
jest.mock('@backend-api/utils/validate');

const getUserMock = jest.mocked(userRepository.getUser);
const createMock = jest.mocked(templateRepository.create);
const validateMock = jest.mocked(validate);

describe('createTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockResolvedValueOnce({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
      data: undefined,
    });

    const result = await createTemplate({} as CreateTemplate, 'token');

    expect(getUserMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });
  });

  test('should return a failure result, when template data is invalid', async () => {
    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'pickles',
      },
    });

    validateMock.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const dto: CreateTemplate = {
      templateType: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
    };

    const result = await createTemplate(dto, 'token');

    expect(validateMock).toHaveBeenCalledWith($CreateTemplateSchema, dto);

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

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockResolvedValueOnce({
      data,
    });

    createMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await createTemplate(data, 'token');

    expect(createMock).toHaveBeenCalledWith(data, 'token');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  });

  test('should return created template', async () => {
    const dto: CreateTemplate = {
      templateType: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
    };

    const template: Template = {
      ...dto,
      id: 'id',
      owner: 'token',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockResolvedValueOnce({
      data: dto,
    });

    createMock.mockResolvedValueOnce({
      data: template,
    });

    const result = await createTemplate(dto, 'token');

    expect(createMock).toHaveBeenCalledWith(dto, 'token');

    expect(result).toEqual({
      data: template,
    });
  });
});
