import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import { userRepository } from '@backend-api/templates/domain/user';
import {
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { listTemplates } from '@backend-api/templates/app/list-templates';

jest.mock('@backend-api/templates/domain/user');
jest.mock('@backend-api/templates/domain/template');

const getUserMock = jest.mocked(userRepository.getUser);
const listMock = jest.mocked(templateRepository.list);

describe('listTemplates', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when user token is invalid', async () => {
    getUserMock.mockResolvedValueOnce({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
      data: undefined,
    });

    const result = await listTemplates('token');

    expect(getUserMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 401,
        message: 'Unauthorized',
      },
    });
  });

  test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    listMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await listTemplates('token');

    expect(listMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });
  });

  test('should return templates', async () => {
    const template: Template = {
      id: 'id',
      owner: 'token',
      version: 1,
      templateType: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getUserMock.mockResolvedValueOnce({
      data: {
        id: 'token',
      },
    });

    listMock.mockResolvedValueOnce({
      data: [template],
    });

    const result = await listTemplates('token');

    expect(listMock).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      data: [template],
    });
  });
});
