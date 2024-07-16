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
  // This line is temporary and should be removed once the CI pipelines are working with an Amplify sandbox
  process.env.CI = undefined;

  // @ts-expect-error this line gives 'type instantiation is excessively long' but the types are from the AWS SDK so we can't change them
  jest
    .mocked(generateServerClientUsingCookies)
    .mockReturnValue(mockAmplifyBackendClient);

  const response = await createSession();

  expect(response).toEqual(mockResponse);
});

// This test is temporary and should be removed once the CI pipelines are working with an Amplify sandbox
test('createSession - CI', async () => {
  process.env.CI = 'true';

  const response = await createSession();

  expect(response).toEqual(undefined);
});
