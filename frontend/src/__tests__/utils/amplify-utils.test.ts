/**
 * @jest-environment node
 */
import {
  getAmplifyBackendClient,
  getAccessTokenServer,
} from '@utils/amplify-utils';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import nextHeaders from 'next/headers';

jest.mock('aws-amplify/auth/server');
jest.mock('@aws-amplify/adapter-nextjs/api');
jest.mock('@/amplify_outputs.json', () => ({
  name: 'mockConfig',
}));
jest.mock('next/headers', () => ({
  cookies: () => {},
}));

const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

test('getAmplifyBackendClient', () => {
  // arrange
  const generateServerClientUsingCookiesMock = jest.mocked(
    generateServerClientUsingCookies
  );
  const cookiesSpy = jest.spyOn(nextHeaders, 'cookies');

  // act
  getAmplifyBackendClient();

  // assert
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledTimes(1);
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledWith({
    config: { name: 'mockConfig' },
    cookies: cookiesSpy,
    authMode: 'iam',
  });
});

describe('getAccessTokenServer', () => {
  test('should return the auth token', async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        accessToken: {
          toString: () => 'mockSub',
          payload: {
            sub: 'mockSub',
          },
        },
      },
    });

    const result = await getAccessTokenServer();

    expect(result).toEqual('mockSub');
  });

  test('should return undefined when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValue({});

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });

  test('should return undefined an error occurs', async () => {
    fetchAuthSessionMock.mockImplementationOnce(() => {
      throw new Error('JWT Expired');
    });

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });
});
