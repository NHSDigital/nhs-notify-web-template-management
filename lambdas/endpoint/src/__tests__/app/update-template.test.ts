import {
  UpdateTemplateInput,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-templates-client';
import {
  $UpdateTemplateSchema,
  Template,
  templateRepository,
} from '../../domain/template';
import { userRepository } from '../../domain/user';
import { updateTemplate } from '../../app/update-template';
import { validate } from '../../utils/validate';

jest.mock('../../domain/user');
jest.mock('../../domain/template');
jest.mock('../../utils/validate');

const getUserMock = jest.mocked(userRepository.getUser);
const updateMock = jest.mocked(templateRepository.update);
const validateMock = jest.mocked(validate);

describe('updateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockResolvedValueOnce({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });

    const result = await updateTemplate({} as UpdateTemplateInput, 'token');

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
        id: 'token',
      },
    });

    validateMock.mockReturnValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const data: UpdateTemplateInput = {
      id: 'id',
      name: 'name',
      message: 'message',
      status: TemplateStatus.NOT_YET_SUBMITTED,
    };

    const result = await updateTemplate(data, 'token');

    expect(validateMock).toHaveBeenCalledWith($UpdateTemplateSchema, data);

    expect(result).toEqual({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });
  });

  test('should return a failure result, when saving to the database unexpectedly fails', async () => {
    const data: UpdateTemplateInput = {
      id: 'id',
      name: 'name',
      message: 'message',
      status: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockReturnValueOnce({
      data,
    });

    updateMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await updateTemplate(data, 'token');

    expect(updateMock).toHaveBeenCalledWith(data, 'token');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  });

  test('should return updated template', async () => {
    const data: UpdateTemplateInput = {
      id: 'id',
      name: 'name',
      message: 'message',
      status: TemplateStatus.NOT_YET_SUBMITTED,
    };

    const template: Template = {
      ...data,
      id: 'id',
      owner: 'token',
      version: 1,
      type: TemplateType.SMS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockReturnValueOnce({
      data,
    });

    updateMock.mockResolvedValueOnce({
      data: template,
    });

    const result = await updateTemplate(data, 'token');

    expect(updateMock).toHaveBeenCalledWith(data, 'token');

    expect(result).toEqual({
      data: template,
    });
  });
});
