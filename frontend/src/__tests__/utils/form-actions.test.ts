/**
 * @jest-environment node
 */
import {
  CreateLetterTemplate,
  CreateUpdateNHSAppTemplate,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import {
  createTemplate,
  saveTemplate,
  getTemplate,
  getTemplates,
  createLetterTemplate,
  setTemplateToDeleted,
  setTemplateToSubmitted,
  requestTemplateProof,
} from '@utils/form-actions';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { TemplateDto } from 'nhs-notify-backend-client';
import { templateClient } from 'nhs-notify-backend-client/src/template-api-client';

const mockedTemplateClient = jest.mocked(templateClient);
const authIdTokenServerMock = jest.mocked(getAccessTokenServer);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/template-api-client');

describe('form-actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authIdTokenServerMock.mockResolvedValueOnce('token');
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
        code: 400,
        message: 'Bad request',
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
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    const createTemplateInput: CreateUpdateNHSAppTemplate = {
      templateType: 'NHS_APP',
      name: 'name',
      message: 'message',
    };

    await expect(createTemplate(createTemplateInput)).rejects.toThrow(
      'Failed to get access token'
    );
  });

  test('createLetterTemplate', async () => {
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

    mockedTemplateClient.createLetterTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const createLetterTemplateInput: CreateLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    const response = await createLetterTemplate(
      createLetterTemplateInput,
      pdf,
      csv
    );

    expect(mockedTemplateClient.createLetterTemplate).toHaveBeenCalledWith(
      createLetterTemplateInput,
      'token',
      pdf,
      csv
    );

    expect(response).toEqual(responseData);
  });

  test('createLetterTemplate accepts empty csv', async () => {
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

    mockedTemplateClient.createLetterTemplate.mockResolvedValueOnce({
      data: responseData,
    });

    const createLetterTemplateInput: CreateLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File([], '', {
      type: 'text/csv',
    });

    const response = await createLetterTemplate(
      createLetterTemplateInput,
      pdf,
      csv
    );

    expect(mockedTemplateClient.createLetterTemplate).toHaveBeenCalledWith(
      createLetterTemplateInput,
      'token',
      pdf,
      undefined
    );

    expect(response).toEqual(responseData);
  });

  test('createLetterTemplate - should throw error when saving unexpectedly fails', async () => {
    mockedTemplateClient.createLetterTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Bad request',
      },
    });

    const createLetterTemplateInput: CreateLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await expect(
      createLetterTemplate(createLetterTemplateInput, pdf, csv)
    ).rejects.toThrow('Failed to create new letter template');

    expect(mockedTemplateClient.createLetterTemplate).toHaveBeenCalledWith(
      createLetterTemplateInput,
      'token',
      pdf,
      csv
    );
  });

  test('createLetterTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    const createLetterTemplateInput: CreateLetterTemplate = {
      templateType: 'LETTER',
      name: 'name',
      letterType: 'x0',
      language: 'en',
    };

    const pdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await expect(
      createLetterTemplate(createLetterTemplateInput, pdf, csv)
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
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    const response = await saveTemplate(updateTemplateInput);

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
        code: 400,
        message: 'Bad request',
      },
    });

    const updateTemplateInput: NHSAppTemplate = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    await expect(saveTemplate(updateTemplateInput)).rejects.toThrow(
      'Failed to save template data'
    );

    expect(mockedTemplateClient.updateTemplate).toHaveBeenCalledWith(
      updateTemplateInput.id,
      updateTemplateInput,
      'token'
    );
  });

  test('saveTemplate - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

    const updateTemplateInput: NHSAppTemplate = {
      id: 'id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    await expect(saveTemplate(updateTemplateInput)).rejects.toThrow(
      'Failed to get access token'
    );
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
        code: 404,
        message: 'Not found',
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
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

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
        code: 500,
        message: 'Internal server error',
      },
    });

    const response = await getTemplates();

    expect(response).toEqual([]);
  });

  test('getTemplates - should throw error when no token', async () => {
    authIdTokenServerMock.mockReset();
    authIdTokenServerMock.mockResolvedValueOnce(undefined);

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
          code: 400,
          message: 'Bad request',
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
      authIdTokenServerMock.mockResolvedValueOnce(undefined);

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
          code: 400,
          message: 'Bad request',
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
      authIdTokenServerMock.mockResolvedValueOnce(undefined);

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
          code: 400,
          message: 'Bad request',
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
      authIdTokenServerMock.mockResolvedValueOnce(undefined);

      await expect(requestTemplateProof('id')).rejects.toThrow(
        'Failed to get access token'
      );
    });
  });
});
