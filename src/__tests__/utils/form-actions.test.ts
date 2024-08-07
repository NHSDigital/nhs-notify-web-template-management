/**
 * @jest-environment node
 */

import { TemplateType } from '@utils/types';
import {
  createSession,
  saveSession,
  getSession,
} from '../../utils/form-actions';

jest.mock('@aws-amplify/adapter-nextjs/data');

const mockResponse = {
  id: 'id',
  sessionId: 'session-id',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
  nhsAppTemplateName: 'template-name',
  nhsAppTemplateMessage: 'template-message',
};

const mockModels = {
  SessionStorage: {
    create: async () => ({ data: mockResponse }),
    update: async () => ({ data: mockResponse }),
    get: async () => ({ data: mockResponse }),
  },
};

const mockSchema = {
  models: undefined as unknown,
};

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => mockSchema,
}));

beforeEach(() => {
  mockSchema.models = mockModels;
});

test('createSession', async () => {
  const response = await createSession({
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });

  expect(response).toEqual(mockResponse);
});

test('saveSession', async () => {
  const response = await saveSession({
    id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });

  expect(response).toEqual(mockResponse);
});

test('getSession', async () => {
  const response = await getSession('session-id');

  expect(response).toEqual(mockResponse);
});

test('getSession - throws error if session is not found', async () => {
  mockSchema.models = {
    SessionStorage: {
      get: async () => ({ data: null }), // eslint-disable-line unicorn/no-null
    },
  };

  await expect(getSession('session-id')).rejects.toThrow(
    'Could not retrieve session'
  );
});
