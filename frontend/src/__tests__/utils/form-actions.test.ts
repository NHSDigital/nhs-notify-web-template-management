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
} from '@utils/form-actions';
import { getSessionServer } from '@utils/amplify-utils';
import { TemplateDto, TemplateStatus } from 'nhs-notify-backend-client';
import { templateApiClient } from 'nhs-notify-backend-client/src/template-api-client';

const mockedTemplateClient = jest.mocked(templateApiClient);
const authIdTokenServerMock = jest.mocked(getSessionServer);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/template-api-client');
jest.mock('nhs-notify-backend-client/src/routing-config-api-client');
jest.mock('nhs-notify-web-template-management-utils/logger');

describe('form-actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authIdTokenServerMock.mockResolvedValue({
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
      lockNumber: 1,
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
    authIdTokenServerMock.mockResolvedValueOnce({});

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
      lockNumber: 1,
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
      lockNumber: 1,
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
    authIdTokenServerMock.mockResolvedValueOnce({});

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
      lockNumber: 1,
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
      lockNumber: 0,
    };

    const response = await saveTemplate(
      updateTemplateInput.id,
      updateTemplateInput
    );

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput,
      'token',
      0
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
      lockNumber: 1,
    };

    await expect(
      saveTemplate(updateTemplateInput.id, updateTemplateInput)
    ).rejects.toThrow('Failed to save template data');

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput,
      'token',
      1
    );
  });

  test('saveTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockResolvedValueOnce({});

    const updateTemplateInput: NHSAppTemplate = {
      id: 'bde7301a-e8c0-404a-8d19-c0b8ef7817f9',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
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
      lockNumber: 1,
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
    authIdTokenServerMock.mockResolvedValueOnce({});

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
      lockNumber: 1,
    } satisfies TemplateDto;

    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: [responseData],
    });

    const response = await getTemplates();

    expect(mockedTemplateClient.listTemplates).toHaveBeenCalledWith(
      'token',
      undefined
    );

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
    authIdTokenServerMock.mockResolvedValueOnce({});

    await expect(getTemplates()).rejects.toThrow('Failed to get access token');
  });

  test('getTemplates - order by updatedAt and then id', async () => {
    const baseTemplate = {
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Template',
      message: 'Message',
      createdAt: '2020-01-01T00:00:00.000Z',
      lockNumber: 1,
    } satisfies Partial<TemplateDto>;

    const templates = [
      { ...baseTemplate, id: '06', updatedAt: '2022-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '08', updatedAt: '2020-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '05', updatedAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '02', updatedAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '01', updatedAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '03', updatedAt: '2021-01-01T00:00:00.000Z' },
      { ...baseTemplate, id: '04', updatedAt: '2021-01-01T00:00:00.000Z' },
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

  test('getTemplates - invalid templates are not listed', async () => {
    const validTemplate: TemplateDto = {
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      name: 'Template',
      message: 'Message',
      createdAt: '2020-01-01T00:00:00.000Z',
      id: '02',
      updatedAt: '2021-01-01T00:00:00.000Z',
      lockNumber: 1,
    };

    mockedTemplateClient.listTemplates.mockResolvedValueOnce({
      data: [
        {
          templateType: 'SMS',
          templateStatus: undefined as unknown as TemplateStatus,
          name: 'Template',
          message: 'Message',
          createdAt: '2020-01-01T00:00:00.000Z',
          id: '01',
          updatedAt: '2021-01-01T00:00:00.000Z',
          lockNumber: 1,
        },
        validTemplate,
      ],
    });

    const response = await getTemplates();

    expect(response).toEqual([validTemplate]);
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
        lockNumber: 1,
      } satisfies TemplateDto;

      mockedTemplateClient.submitTemplate.mockResolvedValueOnce({
        data: responseData,
      });

      const response = await setTemplateToSubmitted('id', 0);

      expect(mockedTemplateClient.submitTemplate).toHaveBeenCalledWith(
        'id',
        'token',
        0
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

      await expect(setTemplateToSubmitted('id', 0)).rejects.toThrow(
        'Failed to save template data'
      );

      expect(mockedTemplateClient.submitTemplate).toHaveBeenCalledWith(
        'id',
        'token',
        0
      );
    });

    test('submitTemplate - should throw error when no token', async () => {
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(setTemplateToSubmitted('id', 0)).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });

  describe('setTemplateToDeleted', () => {
    test('deleteTemplate successfully', async () => {
      mockedTemplateClient.deleteTemplate.mockResolvedValueOnce({
        data: undefined,
      });

      const response = await setTemplateToDeleted('id', 0);

      expect(mockedTemplateClient.deleteTemplate).toHaveBeenCalledWith(
        'id',
        'token',
        0
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

      await expect(setTemplateToDeleted('id', 0)).rejects.toThrow(
        'Failed to save template data'
      );

      expect(mockedTemplateClient.deleteTemplate).toHaveBeenCalledWith(
        'id',
        'token',
        0
      );
    });

    test('deleteTemplate - should throw error when no token', async () => {
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(setTemplateToDeleted('id', 0)).rejects.toThrow(
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
        lockNumber: 1,
      } satisfies TemplateDto;

      mockedTemplateClient.requestProof.mockResolvedValueOnce({
        data: responseData,
      });

      const response = await requestTemplateProof('id', 0);

      expect(mockedTemplateClient.requestProof).toHaveBeenCalledWith(
        'id',
        'token',
        0
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

      await expect(requestTemplateProof('id', 0)).rejects.toThrow(
        'Failed to request proof'
      );

      expect(mockedTemplateClient.requestProof).toHaveBeenCalledWith(
        'id',
        'token',
        0
      );
    });

    test('requestTemplateProof - should throw error when no token', async () => {
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(requestTemplateProof('id', 0)).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });
});
