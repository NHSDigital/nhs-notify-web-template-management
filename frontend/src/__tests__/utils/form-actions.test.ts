/**
 * @jest-environment node
 */
import {
  UploadLetterTemplate,
  CreateUpdateNHSAppTemplate,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import {
  createTemplate,
  saveTemplate,
  getTemplate,
  getTemplates,
  uploadLetterTemplate,
  setTemplateToDeleted,
  setTemplateToSubmitted,
  requestTemplateProof,
  getRoutingConfigs,
  countRoutingConfigs,
} from '@utils/form-actions';
import { getSessionServer } from '@utils/amplify-utils';
import { RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
import { templateApiClient } from 'nhs-notify-backend-client/src/template-api-client';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client/src/routing-config-api-client';

const mockedTemplateClient = jest.mocked(templateApiClient);
const authIdTokenServerMock = jest.mocked(getSessionServer);
const routingConfigurationApiClientMock = jest.mocked(
  routingConfigurationApiClient
);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/template-api-client');
jest.mock('nhs-notify-backend-client/src/routing-config-api-client');

describe('form-actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });
  });

  test('createTemplate', async () => {
    const responseData = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.createTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const createTemplateInput: CreateUpdateNHSAppTemplate = {
      templateType: 'NHS_APP',
      name: 'name',
      message: 'message',
    };

    const response = await createTemplate(createTemplateInput);

    expect(mockedTemplateClient.createTemplate).toHaveBeenCalledWith(
      createTemplateInput,
      'token'
    );

    expect(response).toEqual(responseData);
  });

  test('createTemplate - should throw error when saving unexpectedly fails', async () => {
    mockedTemplateClient.createTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Bad request',
        },
      },
    });

    const createTemplateInput: CreateUpdateNHSAppTemplate = {
      templateType: 'NHS_APP',
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to create new template'
    );

    expect(mockedTemplateClient.createTemplate).toHaveBeenCalledWith(
      createTemplateInput,
      'token'
    );
  });

  test('createTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    const createTemplateInput: CreateUpdateNHSAppTemplate = {
      templateType: 'NHS_APP',
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('uploadLetterTemplate', async () => {
    const responseData = {
      templateType: 'LETTER',
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
      language: 'ar',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: 'pdf-version',
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: 'sample.csv',
          currentVersion: 'csv-version',
          virusScanStatus: 'PASSED',
        },
      },
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.uploadLetterTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const uploadLetterTemplateInput: UploadLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
      campaignId: 'campaign-id',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    const response = await uploadLetterTemplate(
      uploadLetterTemplateInput,
      pdf,
      csv
    );

    expect(mockedTemplateClient.uploadLetterTemplate).toHaveBeenCalledWith(
      uploadLetterTemplateInput,
      'token',
      pdf,
      csv
    );

    expect(response).toEqual(responseData);
  });

  test('uploadLetterTemplate accepts empty csv', async () => {
    const responseData = {
      templateType: 'LETTER',
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
      language: 'ar',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: 'pdf-version',
          virusScanStatus: 'PENDING',
        },
      },
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.uploadLetterTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const uploadLetterTemplateInput: UploadLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
      campaignId: 'campaign-id',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File([], '', {
      type: 'text/csv',
    });

    const response = await uploadLetterTemplate(
      uploadLetterTemplateInput,
      pdf,
      csv
    );

    expect(mockedTemplateClient.uploadLetterTemplate).toHaveBeenCalledWith(
      uploadLetterTemplateInput,
      'token',
      pdf,
      undefined
    );

    expect(response).toEqual(responseData);
  });

  test('uploadLetterTemplate - should throw error when saving unexpectedly fails', async () => {
    mockedTemplateClient.uploadLetterTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Bad request',
        },
      },
    });

    const uploadLetterTemplateInput: UploadLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
      campaignId: 'campaign-id',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await expect(
      uploadLetterTemplate(uploadLetterTemplateInput, pdf, csv)
    ).rejects.toThrow('Failed to create new letter template');

    expect(mockedTemplateClient.uploadLetterTemplate).toHaveBeenCalledWith(
      uploadLetterTemplateInput,
      'token',
      pdf,
      csv
    );
  });

  test('uploadLetterTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    const uploadLetterTemplateInput: UploadLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
      campaignId: 'campaign-id',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await expect(
      uploadLetterTemplate(uploadLetterTemplateInput, pdf, csv)
    ).rejects.toThrow('Failed to get access token');
  });

  test('saveTemplate', async () => {
    const responseData = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.updateTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'ee22daa2-9fce-455a-9e07-91679e4d7999',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    const response = await saveTemplate(
      updateTemplateInput.id,
      updateTemplateInput
    );

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput,
      'token'
    );

    expect(response).toEqual(responseData);
  });

  test('saveTemplate - should throw error when saving unexpectedly fails', async () => {
    mockedTemplateClient.updateTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Bad request',
        },
      },
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'bde7301a-e8c0-404a-8d19-c0b8ef7817f9',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    await expect(
      saveTemplate(updateTemplateInput.id, updateTemplateInput)
    ).rejects.toThrow('Failed to save template data');

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput,
      'token'
    );
  });

  test('saveTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'bde7301a-e8c0-404a-8d19-c0b8ef7817f9',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    await expect(
      saveTemplate(updateTemplateInput.id, updateTemplateInput)
    ).rejects.toThrow('Failed to get access token');
  });

  test('getTemplate', async () => {
    const responseData = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.getTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const response = await getTemplate('id');

    expect(mockedTemplateClient.getTemplate).toHaveBeenCalledWith(
      'id',
      'token'
    );

    expect(response).toEqual(responseData);
  });

  test('getTemplate - should return undefined when no data', async () => {
    mockedTemplateClient.getTemplate.mockResolvedValueOnce({
      data: undefined,
      error: {
        errorMeta: {
          code: 404,
          description: 'Not found',
        },
      },
    });

    const response = await getTemplate('id');

    expect(mockedTemplateClient.getTemplate).toHaveBeenCalledWith(
      'id',
      'token'
    );

    expect(response).toEqual(undefined);
  });

  test('getTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    await expect(getTemplate('id')).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('getTemplates', async () => {
    const responseData = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: [responseData],
    });

    const response = await getTemplates();

    expect(mockedTemplateClient.listTemplates).toHaveBeenCalledWith('token');

    expect(response).toEqual([responseData]);
  });

  test('getTemplates - should return empty array when fetching unexpectedly fails', async () => {
    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: undefined,
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const response = await getTemplates();

    expect(response).toEqual([]);
  });

  test('getTemplates - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    await expect(getTemplates()).rejects.toThrow('Failed to get access token');
  });

  test('getTemplates - order by createdAt and then id', async () => {
    const baseTemplate = {
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Template',
      message: 'Message',
      updatedAt: '2021-01-01T00:00:00.000Z',
    } satisfies Partial<TemplateDto>;

    const templates = [
      { ...baseTemplate, id: '06', createdAt: '2022-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '08', createdAt: '2020-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '05', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '02', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '01', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '03', createdAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '04', createdAt: '2021-01-01T00:00:00.000Z' },
    ];

    // 06 is the newest, 08 is the oldest.
    // 01 - 05 all have the same createdAt.
    const expectedOrder = ['06', '01', '02', '03', '04', '05', '08'];

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

  describe('setTemplateToSubmitted', () => {
    test('submitTemplate successfully', async () => {
      const responseData = {
        id: 'id',
        templateType: 'NHS_APP',
        templateStatus: 'SUBMITTED',
        name: 'name',
        message: 'message',
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
      } satisfies TemplateDto;

      mockedTemplateClient.submitTemplate.mockResolvedValueOnce({
        data: responseData,
      });

      const response = await setTemplateToSubmitted('id');

      expect(mockedTemplateClient.submitTemplate).toHaveBeenCalledWith(
        'id',
        'token'
      );

      expect(response).toEqual(responseData);
    });

    test('submitTemplate - should throw error when saving unexpectedly fails', async () => {
      mockedTemplateClient.submitTemplate.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 400,
            description: 'Bad request',
          },
        },
      });

      await expect(setTemplateToSubmitted('id')).rejects.toThrow(
        'Failed to save template data'
      );

      expect(mockedTemplateClient.submitTemplate).toHaveBeenCalledWith(
        'id',
        'token'
      );
    });

    test('submitTemplate - should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(setTemplateToSubmitted('id')).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });

  describe('setTemplateToDeleted', () => {
    test('deleteTemplate successfully', async () => {
      mockedTemplateClient.deleteTemplate.mockResolvedValueOnce({
        data: undefined,
      });

      const response = await setTemplateToDeleted('id');

      expect(mockedTemplateClient.deleteTemplate).toHaveBeenCalledWith(
        'id',
        'token'
      );

      expect(response).toEqual(undefined);
    });

    test('deleteTemplate - should throw error when saving unexpectedly fails', async () => {
      mockedTemplateClient.deleteTemplate.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 400,
            description: 'Bad request',
          },
        },
      });

      await expect(setTemplateToDeleted('id')).rejects.toThrow(
        'Failed to save template data'
      );

      expect(mockedTemplateClient.deleteTemplate).toHaveBeenCalledWith(
        'id',
        'token'
      );
    });

    test('deleteTemplate - should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(setTemplateToDeleted('id')).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });

  describe('requestTemplateProof', () => {
    test('sends proof request successfully', async () => {
      const responseData = {
        templateType: 'LETTER',
        id: 'new-template-id',
        templateStatus: 'NOT_YET_SUBMITTED',
        name: 'template-name',
        letterType: 'x1',
        language: 'ar',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: 'pdf-version',
            virusScanStatus: 'PASSED',
          },
        },
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
      } satisfies TemplateDto;

      mockedTemplateClient.requestProof.mockResolvedValueOnce({
        data: responseData,
      });

      const response = await requestTemplateProof('id');

      expect(mockedTemplateClient.requestProof).toHaveBeenCalledWith(
        'id',
        'token'
      );

      expect(response).toEqual(responseData);
    });

    test('requestTemplateProof - should throw error when request unexpectedly fails', async () => {
      mockedTemplateClient.requestProof.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 400,
            description: 'Bad request',
          },
        },
      });

      await expect(requestTemplateProof('id')).rejects.toThrow(
        'Failed to request proof'
      );

      expect(mockedTemplateClient.requestProof).toHaveBeenCalledWith(
        'id',
        'token'
      );
    });

    test('requestTemplateProof - should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(requestTemplateProof('id')).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });

  describe('getRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(getRoutingConfigs()).rejects.toThrow(
        'Failed to get access token'
      );
    });

    test('should return empty array when calling the API fails', async () => {
      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await getRoutingConfigs();

      expect(response.length).toBe(0);
    });

    test('should return a list of routing configs - order by createdAt and then id', async () => {
      const fields = {
        status: 'DRAFT',
        name: 'Routing config',
        updatedAt: '2021-01-01T00:00:00.000Z',
        campaignId: 'campaignId',
        clientId: 'clientId',
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: 'id',
            cascadeGroups: ['standard'],
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      } satisfies Omit<RoutingConfig, 'id' | 'createdAt'>;

      const routingConfigs = [
        {
          ...fields,
          id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
          createdAt: '2022-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '8f5157fe-72d7-4a9c-818f-77c128ec8197',
          createdAt: '2020-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '1cfdd62d-9eca-4f15-9772-1937d4524c37',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '18da6158-07ef-455c-9c31-1a4d78a133cf',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '87fb5cbf-708d-49c3-9360-3e37efdc5278',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '0d6408fd-57ea-42f2-aae1-ed9614b67068',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
      ];

      // a48... is the newest, 8f5... is the oldest.
      // the others all have the same createdAt.
      const expectedOrder = [
        'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
        '0d6408fd-57ea-42f2-aae1-ed9614b67068',
        '18da6158-07ef-455c-9c31-1a4d78a133cf',
        '1cfdd62d-9eca-4f15-9772-1937d4524c37',
        '87fb5cbf-708d-49c3-9360-3e37efdc5278',
        '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
        '8f5157fe-72d7-4a9c-818f-77c128ec8197',
      ];

      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        data: routingConfigs,
      });

      const response = await getRoutingConfigs();

      const actualOrder = [];
      for (const routingConfig of response) {
        actualOrder.push(routingConfig.id);
      }

      expect(actualOrder).toEqual(expectedOrder);
    });

    test('invalid routing configs are not listed', async () => {
      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        data: [
          {
            status: 'DRAFT',
            name: 'Routing config',
            updatedAt: '2021-01-01T00:00:00.000Z',
            campaignId: 'campaignId',
            clientId: 'clientId',
            cascade: [],
            cascadeGroupOverrides: [{ name: 'standard' }],
            id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
            createdAt: '2022-01-01T00:00:00.000Z',
          },
        ],
      });

      const response = await getRoutingConfigs();

      expect(response).toEqual([]);
    });
  });

  describe('countRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(countRoutingConfigs('DRAFT')).rejects.toThrow(
        'Failed to get access token'
      );
    });

    test('should return 0 when calling the API fails', async () => {
      routingConfigurationApiClientMock.count.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await countRoutingConfigs('DRAFT');

      expect(response).toBe(0);
    });

    test('should return count of routing configurations for status', async () => {
      // Note: we're doing this here because we call `getSessionServer` twice
      // and it's only mocked-out once by default.
      authIdTokenServerMock.mockResolvedValue({
        accessToken: 'token',
        clientId: 'client1',
      });

      routingConfigurationApiClientMock.count
        .mockResolvedValueOnce({
          data: { count: 1 },
        })
        .mockResolvedValueOnce({
          data: { count: 5 },
        });

      const draftCount = await countRoutingConfigs('DRAFT');
      const completedCount = await countRoutingConfigs('COMPLETED');

      expect(draftCount).toEqual(1);
      expect(routingConfigurationApiClientMock.count).toHaveBeenNthCalledWith(
        1,
        'token',
        'DRAFT'
      );
      expect(completedCount).toEqual(5);
      expect(routingConfigurationApiClientMock.count).toHaveBeenNthCalledWith(
        2,
        'token',
        'COMPLETED'
      );
    });
  });
});
