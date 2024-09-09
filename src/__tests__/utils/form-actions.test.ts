/**
 * @jest-environment node
 */

import { TemplateType } from '@utils/types';
import {
  createSession,
  saveSession,
  getSession,
  saveTemplate,
} from '@utils/form-actions';
import { Template } from '@domain/templates';

jest.mock('@aws-amplify/adapter-nextjs/data');

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
};

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => mockSchema,
}));

beforeEach(() => {
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

test('saveTemplate - throws error when failing to save', async () => {
  const template: Template = {
    fields: { body: 'body' },
    name: 'name',
    type: TemplateType.NHS_APP,
    version: 1,
  };

  mockTemplateResponse.errors = ['something went wrong'];

  await expect(saveTemplate(template)).rejects.toThrow(
    'Failed saving NHS_APP template'
  );
});

test('saveTemplate - no errors but no data', async () => {
  const template: Template = {
    fields: { body: 'body' },
    name: 'name',
    type: TemplateType.NHS_APP,
    version: 1,
  };

  mockTemplateResponse.errors = undefined;
  mockTemplateResponse.data = undefined as unknown as Template;

  await expect(saveTemplate(template)).rejects.toThrow(
    'NHS_APP template entity in unknown state. No errors reported but entity returned as falsy'
  );
});

test('saveTemplate - should return saved data', async () => {
  const template: Template = {
    fields: { body: 'body' },
    name: 'name',
    type: TemplateType.NHS_APP,
    version: 1,
  };

  const expected = {
    ...template,
    id: 'randomUUID',
    createdAt: 'yesterday',
    updatedAt: 'today',
  };

  mockTemplateResponse.data = expected;

  const entity = await saveTemplate(template);
  expect(entity).toEqual(expected);
});
