import {
  CreateTemplateInput,
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-templates-client';
import { validate } from '../../utils/validate';
import { userRepository } from '../../domain/user';
import {
  $CreateTemplateSchema,
  Template,
  templateRepository,
} from '../../domain/template';
import { createTemplate } from '../../app/create-template';

jest.mock('../../domain/user');
jest.mock('../../domain/template');
jest.mock('../../utils/validate');

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
    });

    const result = await createTemplate({} as TemplateDTO, 'token');

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

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'pickles',
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

    expect(createMock).toHaveBeenCalledWith(data, 'pickles');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  });

  test('should return a failure result, when saving to the database returns undefined', async () => {
    const data: CreateTemplateInput = {
      type: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'pickles',
      },
    });

    validateMock.mockReturnValueOnce({
      data,
    });

    createMock.mockResolvedValueOnce({
      data: undefined,
    });

    const result = await createTemplate(data, 'token');

    expect(createMock).toHaveBeenCalledWith(data, 'pickles');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Template not created',
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

    getUserMock.mockResolvedValueOnce({
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
