/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { getSessionServer, getSessionId, getClientId } from '../../utils/amplify-utils';

jest.mock('aws-amplify/auth/server');
jest.mock('@aws-amplify/adapter-nextjs/api');
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: jest.fn(),
  }),
}));
jest.mock('@/amplify_outputs.json', () => ({
  name: 'mockConfig',
}));

const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

describe('amplify-utils', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  })

  test('getSessionServer - should return the auth token and userSub', async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => 'mockToken',
          payload: {},
        },
      },
      userSub: 'sub',
    });

    const result = await getSessionServer();

    expect(result).toEqual({ accessToken: 'mockToken', userSub: 'sub' });
  });

  test('getSessionServer - should return undefined properties when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({});

    const result = await getSessionServer();

    expect(result).toEqual({ accessToken: undefined, userSub: undefined });
  });

  test('getSessionServer - should return undefined properties if an error occurs', async () => {
    fetchAuthSessionMock.mockImplementationOnce(() => {
      throw new Error('JWT Expired');
    });

    const result = await getSessionServer();

    expect(result).toEqual({ accessToken: undefined, userSub: undefined });
  });

  describe('getSessionId', () => {
    test('returns undefined when access token not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({});

      await expect(getSessionId()).resolves.toBeUndefined();
    });

    test('returns undefined when session ID not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () => sign({}, 'key'),
            payload: {},
          },
        },
      });

      await expect(getSessionId()).resolves.toBeUndefined();
    });

    test('returns session id', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () =>
              sign(
                {
                  origin_jti: 'jti',
                },
                'key'
              ),
            payload: {},
          },
        },
      });

      const sessionId = await getSessionId();

      expect(sessionId).toEqual('jti');
    });
  });

  describe('getClientId', () => {
    test('returns undefined when access token not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({});

      await expect(getClientId()).resolves.toBeUndefined();
    });

    test('returns undefined when client ID not found', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () => sign({}, 'key'),
            payload: {},
          },
        },
      });

      await expect(getClientId()).resolves.toBeUndefined();
    });

    test('returns client id', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () =>
              sign(
                {
                  ['nhs-notify:client-id']: 'client1',
                },
                'key'
              ),
            payload: {},
          },
        },
      });

      const clientId = await getClientId();

      expect(clientId).toEqual('client1');
    });

    test('retrieves client id from access token param if provided', async () => {
      fetchAuthSessionMock.mockResolvedValueOnce({
        tokens: {
          accessToken: {
            toString: () =>
              sign(
                {
                  ['nhs-notify:client-id']: 'client1',
                },
                'key'
              ),
            payload: {},
          },
        },
      });

      const mockAccessToken = sign({ ['nhs-notify:client-id']: 'client2' }, 'key')

      const clientId = await getClientId(mockAccessToken);

      expect(clientId).toEqual('client2');
    });
  });
});
