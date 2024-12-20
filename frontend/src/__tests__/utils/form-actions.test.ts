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
  sendEmail,
  getTemplates,
} from '@utils/form-actions';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { mockDeep } from 'jest-mock-extended';
import { IBackendClient } from 'nhs-notify-backend-client/src/types/backend-client';

const mockedBackendClient = mockDeep<IBackendClient>();
const authIdTokenServerMock = jest.mocked(getAccessTokenServer);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/backend-api-client', () => ({
  BackendClient: () => mockedBackendClient,
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
      createdAt: 'today',
      updatedAt: 'today',
    };

    mockedBackendClient.templates.createTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const createTemplateInput: Draft<NHSAppTemplate> = {
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    const response = await createTemplate(createTemplateInput);

    expect(mockedBackendClient.templates.createTemplate).toHaveBeenCalledWith(
      createTemplateInput
    );

    expect(response).toEqual(responseData);
  });

  test('createTemplate - should thrown error when saving unexpectedly fails', async () => {
    mockedBackendClient.templates.createTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const createTemplateInput: Draft<NHSAppTemplate> = {
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to create new template'
    );

    expect(mockedBackendClient.templates.createTemplate).toHaveBeenCalledWith(
      createTemplateInput
    );
  });

  test('saveTemplate', async () => {
    const responseData = {
      id: 'id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: 'today',
      updatedAt: 'today',
    };

    mockedBackendClient.templates.updateTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'pickle',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    const response = await saveTemplate(updateTemplateInput);

    expect(mockedBackendClient.templates.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput
    );

    expect(response).toEqual(responseData);
  });

  test('saveTemplate - should thrown error when saving unexpectedly fails', async () => {
    mockedBackendClient.templates.updateTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'pickle',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    await expect(saveTemplate(updateTemplateInput)).rejects.toThrow(
      'Failed to save template data'
    );

    expect(mockedBackendClient.templates.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput
    );
  });

  test('getTemplate', async () => {
    const responseData = {
      id: 'id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: 'today',
      updatedAt: 'today',
    };

    mockedBackendClient.templates.getTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const response = await getTemplate('id');

    expect(mockedBackendClient.templates.getTemplate).toHaveBeenCalledWith(
      'id'
    );

    expect(response).toEqual(responseData);
  });

  test('getTemplate - should return undefined when no data', async () => {
    mockedBackendClient.templates.getTemplate.mockResolvedValueOnce({
      data: undefined,
      error: {
        code: 404,
        message: 'Not found',
      },
    });

    const response = await getTemplate('id');

    expect(mockedBackendClient.templates.getTemplate).toHaveBeenCalledWith(
      'id'
    );

    expect(response).toEqual(undefined);
  });

  test('getTemplates', async () => {
    const responseData = {
      id: 'id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: 'today',
      updatedAt: 'today',
    };

    mockedBackendClient.templates.listTemplates.mockResolvedValueOnce({
      data: [responseData],
    });

    const response = await getTemplates();

    expect(mockedBackendClient.templates.listTemplates).toHaveBeenCalledWith();

    expect(response).toEqual([responseData]);
  });

  test('getTemplates - should return empty array when fetching unexpectedly fails', async () => {
    mockedBackendClient.templates.listTemplates.mockResolvedValueOnce({
      data: undefined,
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const response = await getTemplates();

    expect(response).toEqual([]);
  });

  test('sendEmail', async () => {
    mockedBackendClient.functions.sendEmail.mockResolvedValueOnce({
      data: undefined,
      error: undefined,
    });

    const response = await sendEmail('id');

    expect(mockedBackendClient.functions.sendEmail).toHaveBeenCalledWith('id');

    expect(response).toEqual(undefined);
  });

  test('getTemplates - should return nothing when an error occurs', async () => {
    mockedBackendClient.functions.sendEmail.mockResolvedValueOnce({
      data: undefined,
      error: {
        code: 404,
        message: 'Not found',
      },
    });

    const response = await sendEmail('id');

    expect(mockedBackendClient.functions.sendEmail).toHaveBeenCalledWith('id');

    expect(response).toEqual(undefined);
  });
});

test('getTemplates - order by createdAt and then id', async () => {
  const baseTemplate = {
    version: 1,
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
    { ...baseTemplate, id: '09', createdAt: undefined as unknown as string },
    { ...baseTemplate, id: '10', createdAt: undefined as unknown as string },
    { ...baseTemplate, id: '01', createdAt: '2021-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '07', createdAt: undefined as unknown as string },
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

  mockedBackendClient.templates.listTemplates.mockResolvedValueOnce({
    data: templates,
  });

  const response = await getTemplates();

  const actualOrder = [];
  for (const template of response) {
    actualOrder.push(template.id);
  }

  expect(actualOrder).toEqual(expectedOrder);
});
