/**
 * @jest-environment node
 */

import { TemplateType } from '@utils/types';
import {
  createSession,
  saveSession,
  getSession,
  sendEmail,
} from '@utils/form-actions';
import { logger } from '@utils/logger';

jest.mock('@aws-amplify/adapter-nextjs/data');
jest.mock('@utils/logger');

const mockResponseData = {
  id: 'id',
  sessionId: 'session-id',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
  nhsAppTemplateName: 'template-name',
  nhsAppTemplateMessage: 'template-message',
};

const mockResponse = {
  data: mockResponseData as unknown,
  errors: undefined as unknown,
};

const mockTemplateResponse = {
  data: {} as unknown,
  errors: undefined as unknown,
};

const mockModels = {
  SessionStorage: {
    create: async () => mockResponse,
    update: async () => mockResponse,
    get: async () => mockResponse,
  },
  TemplateStorage: {
    create: async () => mockTemplateResponse,
  },
};

const mockSchema = {
  models: mockModels,
  queries: {
    sendEmail: ({ templateId }: { templateId: string }) => {
      if (templateId === 'template-id-error') {
        return {
          errors: ['email error'],
        };
      }

      return {};
    },
  },
};

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => mockSchema,
}));

beforeEach(() => {
  jest.resetAllMocks();
  mockResponse.errors = undefined;
  mockResponse.data = mockResponseData;
});

test('createSession', async () => {
  const response = await createSession({
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });

  expect(response).toEqual(mockResponse.data);
});

test('createSession - error handling', async () => {
  mockResponse.errors = [
    {
      message: 'test-error-message',
      errorType: 'test-error-type',
      errorInfo: { error: 'test-error' },
    },
  ];
  mockResponse.data = undefined;

  await expect(
    createSession({
      templateType: 'UNKNOWN',
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    })
  ).rejects.toThrow('Failed to create new template');
});

test('saveSession', async () => {
  const response = await saveSession({
    id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });

  expect(response).toEqual(mockResponse.data);
});

test('saveSession - error handling', async () => {
  mockResponse.errors = [
    {
      message: 'test-error-message',
      errorType: 'test-error-type',
      errorInfo: { error: 'test-error' },
    },
  ];
  mockResponse.data = undefined;

  await expect(
    saveSession({
      id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  ).rejects.toThrow('Failed to save template data');
});

test('getSession', async () => {
  const response = await getSession('session-id');

  expect(response).toEqual(mockResponse.data);
});

test('getSession - returns undefined if session is not found', async () => {
  mockResponse.errors = [
    {
      message: 'test-error-message',
      errorType: 'test-error-type',
      errorInfo: { error: 'test-error' },
    },
  ];
  mockResponse.data = undefined;

  const response = await getSession('session-id');

  expect(response).toBeUndefined();
});

test('sendEmail - no errors', async () => {
  const mockLogger = jest.mocked(logger);
  await sendEmail('template-id', 'template-name', 'template-message');

  expect(mockLogger.error).not.toHaveBeenCalled();
});

test('sendEmail - errors', async () => {
  const mockLogger = jest.mocked(logger);
  await sendEmail('template-id-error', 'template-name', 'template-message');

  expect(mockLogger.error).toHaveBeenCalledWith({
    description: 'Error sending email',
    res: {
      errors: ['email error'],
    },
  });
});
