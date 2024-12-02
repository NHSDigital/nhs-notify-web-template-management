import {
  UpdateTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  $UpdateTemplateSchema,
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { updateTemplate } from '@backend-api/templates/app/update-template';
import { validate } from '@backend-api/utils/validate';

jest.mock('@backend-api/templates/domain/user');
jest.mock('@backend-api/templates/domain/template');
jest.mock('@backend-api/utils/validate');

const getUserMock = jest.mocked(userRepository.getUser);
const updateMock = jest.mocked(templateRepository.update);
const validateMock = jest.mocked(validate);

describe('updateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockResolvedValueOnce({
      error: {
        code: 403,
        message: 'Unauthorized',
      },
      data: undefined,
    });

    const result = await updateTemplate('id', {} as UpdateTemplate, 'token');

    expect(getUserMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 403,
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

    const result = await updateTemplate('id', data, 'token');

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

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockResolvedValueOnce({
      data,
    });

    updateMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await updateTemplate('id', data, 'token');

    expect(updateMock).toHaveBeenCalledWith('id', data, 'token');

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

    const template: Template = {
      ...data,
      id: 'id',
      owner: 'token',
      version: 1,
      templateType: TemplateType.SMS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    validateMock.mockResolvedValueOnce({
      data,
    });

    updateMock.mockResolvedValueOnce({
      data: template,
    });

    const result = await updateTemplate('id', data, 'token');

    expect(updateMock).toHaveBeenCalledWith('id', data, 'token');

    expect(result).toEqual({
      data: template,
    });
  });
});
