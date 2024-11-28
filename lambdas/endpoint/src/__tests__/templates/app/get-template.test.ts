import { TemplateStatus, TemplateType } from 'nhs-notify-templates-client';
import { userRepository } from '@backend-api/templates/domain/user';
import {
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { getTemplate } from '@backend-api/templates/app/get-template';

jest.mock('@backend-api/templates/domain/user');
jest.mock('@backend-api/templates/domain/template');

const getUserMock = jest.mocked(userRepository.getUser);
const getMock = jest.mocked(templateRepository.get);

describe('getTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockReturnValueOnce({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });

    const result = await getTemplate('id', 'token');

    expect(getUserMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });
  });

  test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
    getUserMock.mockReturnValueOnce({
      data: {
        id: 'token',
      },
    });

    getMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await getTemplate('id', 'token');

    expect(getMock).toHaveBeenCalledWith('id', 'token');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  });

  test('should return template', async () => {
    const template: Template = {
      id: 'id',
      owner: 'token',
      version: 1,
      type: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getUserMock.mockReturnValueOnce({
      data: {
        id: 'token',
      },
    });

    getMock.mockResolvedValueOnce({
      data: template,
    });

    const result = await getTemplate('id', 'token');

    expect(getMock).toHaveBeenCalledWith('id', 'token');

    expect(result).toEqual({
      data: template,
    });
  });
});
