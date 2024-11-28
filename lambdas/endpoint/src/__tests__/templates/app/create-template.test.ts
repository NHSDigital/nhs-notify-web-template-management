import {
  CreateTemplateInput,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-templates-client';
import {
  $CreateTemplateSchema,
  Template,
  templateRepository,
} from '@templates/domain/template';
import { userRepository } from '@templates/domain/user';
import { createTemplate } from '@templates/app/create-template';
import { validate } from '@utils/validate';

jest.mock('@templates/domain/template/template-repository');
jest.mock('@templates/domain/user');
jest.mock('@utils/validate');

const getUserMock = jest.mocked(userRepository.getUser);
const createMock = jest.mocked(templateRepository.create);
const validateMock = jest.mocked(validate);

describe('createTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockReturnValueOnce({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });

    const result = await createTemplate({} as CreateTemplateInput, 'token');

    expect(getUserMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });
  });

  test('should return a failure result, when template data is invalid', async () => {
    getUserMock.mockReturnValueOnce({
      data: {
        id: 'pickles',
      },
    });

    validateMock.mockReturnValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const dto: CreateTemplateInput = {
      type: TemplateType.EMAIL,
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
    const data: CreateTemplateInput = {
      type: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
    };

    getUserMock.mockReturnValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockReturnValueOnce({
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
    const dto: CreateTemplateInput = {
      type: TemplateType.EMAIL,
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
      status: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getUserMock.mockReturnValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockReturnValueOnce({
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
