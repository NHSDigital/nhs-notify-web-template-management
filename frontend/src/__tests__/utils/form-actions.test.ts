/**
 * @jest-environment node
 */
import {
  NHSAppTemplate,
  Draft,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import {
  createTemplate,
  saveTemplate,
  getTemplate,
  getTemplates,
} from '@utils/form-actions';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { mockDeep } from 'jest-mock-extended';
import { ITemplateClient } from 'nhs-notify-backend-client';

const mockedTemplateClient = mockDeep<ITemplateClient>();
const authIdTokenServerMock = jest.mocked(getAccessTokenServer);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/template-api-client', () => ({
  TemplateClient: () => mockedTemplateClient,
}));

describe('form-actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authIdTokenServerMock.mockResolvedValueOnce('token');
  });

  test('createTemplate', async () => {
    const responseData = {
      id: 'id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    mockedTemplateClient.createTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const createTemplateInput: Draft<NHSAppTemplate> = {
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    const response = await createTemplate(createTemplateInput);

    expect(mockedTemplateClient.createTemplate).toHaveBeenCalledWith(
      createTemplateInput
    );

    expect(response).toEqual(responseData);
  });

  test('createTemplate - should thrown error when saving unexpectedly fails', async () => {
    mockedTemplateClient.createTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const createTemplateInput: Draft<NHSAppTemplate> = {
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to create new template'
    );

    expect(mockedTemplateClient.createTemplate).toHaveBeenCalledWith(
      createTemplateInput
    );
  });

  test('createTemplate - should thrown error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    const createTemplateInput: Draft<NHSAppTemplate> = {
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('saveTemplate', async () => {
    const responseData = {
      id: 'id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    mockedTemplateClient.updateTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'pickle',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    const response = await saveTemplate(updateTemplateInput);

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput
    );

    expect(response).toEqual(responseData);
  });

  test('saveTemplate - should thrown error when saving unexpectedly fails', async () => {
    mockedTemplateClient.updateTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'pickle',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(saveTemplate(updateTemplateInput)).rejects.toThrow(
      'Failed to save template data'
    );

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput
    );
  });

  test('saveTemplate - should thrown error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    const updateTemplateInput: NHSAppTemplate = {
      id: 'pickle',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(saveTemplate(updateTemplateInput)).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('getTemplate', async () => {
    const responseData = {
      id: 'id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    mockedTemplateClient.getTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const response = await getTemplate('id');

    expect(mockedTemplateClient.getTemplate).toHaveBeenCalledWith('id');

    expect(response).toEqual(responseData);
  });

  test('getTemplate - should return undefined when no data', async () => {
    mockedTemplateClient.getTemplate.mockResolvedValueOnce({
      data: undefined,
      error: {
        code: 404,
        message: 'Not found',
      },
    });

    const response = await getTemplate('id');

    expect(mockedTemplateClient.getTemplate).toHaveBeenCalledWith('id');

    expect(response).toEqual(undefined);
  });

  test('getTemplate - should thrown error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    await expect(getTemplate('id')).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('getTemplates', async () => {
    const responseData = {
      id: 'id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: [responseData],
    });

    const response = await getTemplates();

    expect(mockedTemplateClient.listTemplates).toHaveBeenCalledWith();

    expect(response).toEqual([responseData]);
  });

  test('getTemplates - should return empty array when fetching unexpectedly fails', async () => {
    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: undefined,
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const response = await getTemplates();

    expect(response).toEqual([]);
  });

  test('getTemplates - should thrown error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    await expect(getTemplates()).rejects.toThrow('Failed to get access token');
  });

  test('getTemplates - order by createdAt and then id', async () => {
    const baseTemplate = {
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'Template',
      message: 'Message',
      updatedAt: '2021-01-01T00:00:00.000Z',
    };

    const templates = [
      { ...baseTemplate, id: '06', createdAt: '2022-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '08', createdAt: '2020-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '05', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '02', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '09', createdAt: '' },
      { ...baseTemplate, id: '10', createdAt: '' },
      { ...baseTemplate, id: '01', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '07', createdAt: '' },
      { ...baseTemplate, id: '03', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '04', createdAt: '2021-01-01T00:00:00.000Z' },
    ];

    // 06 is the newest, 08 is the oldest.
    // Templates without a createdAt, 07, 09 and 10, go at the end.
    // 01 - 05 all have the same createdAt.
    const expectedOrder = [
      '06',
      '01',
      '02',
      '03',
      '04',
      '05',
      '08',
      '07',
      '09',
      '10',
    ];

    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: templates,
    });

    const response = await getTemplates();

    const actualOrder = [];
    for (const template of response) {
      actualOrder.push(template.id);
    }

    expect(actualOrder).toEqual(expectedOrder);
  });
});
