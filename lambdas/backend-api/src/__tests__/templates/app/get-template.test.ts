import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import {
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { getTemplate } from '@backend-api/templates/app/get-template';

jest.mock('@backend-api/templates/domain/template');

const getMock = jest.mocked(templateRepository.get);

describe('getTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
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
      templateType: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

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
