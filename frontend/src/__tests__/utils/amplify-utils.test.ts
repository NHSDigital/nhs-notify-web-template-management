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
jest.mock('next/headers', () => ({
  cookies: () => {},
}));

const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

const OLD_ENV = process.env;

describe('amplify-utils', () => {
  beforeAll(() => {
    process.env = {
      ...OLD_ENV,
      COGNITO_USER_POOL_ID: 'mockUserPoolId',
      COGNITO_USER_POOL_CLIENT_ID: 'mockUserPoolClientId',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

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
      config: {
        auth: {
          aws_region: 'eu-west-2',
          user_pool_id: 'mockUserPoolId',
          user_pool_client_id: 'mockUserPoolClientId',
        },
      },
      cookies: cookiesSpy,
      authMode: 'iam',
    });
  });

  test('getAccessTokenServer - should return the auth token', async () => {
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

  test('getAccessTokenServer -should return undefined when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValue({});

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });

  test('getAccessTokenServer - should return undefined an error occurs', async () => {
    fetchAuthSessionMock.mockImplementationOnce(() => {
      throw new Error('JWT Expired');
    });

    const result = await getAccessTokenServer();

    expect(result).toBeUndefined();
  });
});
