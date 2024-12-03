import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import {
  Template,
  templateRepository,
} from '@backend-api/templates/domain/template';
import { listTemplates } from '@backend-api/templates/app/list-templates';

jest.mock('@backend-api/templates/domain/template');

const listMock = jest.mocked(templateRepository.list);

describe('listTemplates', () => {
  beforeEach(jest.resetAllMocks);

  test('should return a failure result, when fetching from the database unexpectedly fails', async () => {
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
