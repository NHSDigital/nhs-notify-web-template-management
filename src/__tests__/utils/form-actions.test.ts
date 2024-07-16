/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { getAmplifyBackendClient } from '@/src/utils/amplify-utils';
import { createSession } from '../../utils/form-actions';

jest.mock('@aws-amplify/adapter-nextjs/data');

const mockResponse = {
  id: 'id',
  sessionId: 'session-id',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
};

const mockAmplifyBackendClient = mockDeep<
  ReturnType<typeof getAmplifyBackendClient>
>({
  models: {
    SessionStorage: {
      create: async () => ({ data: mockResponse }),
    },
  },
});

test('createSession', async () => {
  // @ts-expect-error this line gives 'type instantiation is excessively long' but the types are from the AWS SDK so we can't change them
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(mockAmplifyBackendClient);

  const response = await createSession();

  expect(response).toEqual(mockResponse);
});
