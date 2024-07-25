/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { getAmplifyBackendClient } from '@/src/utils/amplify-utils';
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

const mockAmplifyBackendClient = mockDeep<
  ReturnType<typeof getAmplifyBackendClient>
>({
  models: {
    SessionStorage: {
      create: async () => ({ data: mockResponse }),
      update: async () => ({ data: mockResponse }),
      get: async () => ({ data: mockResponse }),
    },
  },
});

test('createSession', async () => {
  // @ts-expect-error this line gives 'type instantiation is excessively long' but the types are from the AWS SDK so we can't change them
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(mockAmplifyBackendClient);

  const response = await createSession({
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });

  expect(response).toEqual(mockResponse);
});

test('saveSession', async () => {
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(mockAmplifyBackendClient);

  const response = await saveSession('session-id', {
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });

  expect(response).toEqual(mockResponse);
});

test('getSession', async () => {
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(mockAmplifyBackendClient);

  const response = await getSession('session-id');

  expect(response).toEqual(mockResponse);
});

test('getSession - throws error if session is not found', async () => {
  const amplifyBackendClient = mockDeep<
    ReturnType<typeof getAmplifyBackendClient>
  >({
    models: {
      SessionStorage: {
        get: async () => ({ data: null }), // eslint-disable-line unicorn/no-null
      },
    },
  });
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(amplifyBackendClient);

  await expect(getSession('session-id')).rejects.toThrow(
    'Could not retrieve session'
  );
});
