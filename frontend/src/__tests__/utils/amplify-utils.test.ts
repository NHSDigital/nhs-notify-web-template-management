/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { getSessionServer, getSessionId } from '../../utils/amplify-utils';

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
  });

  test('getSessionServer - should return the auth token and clientID', async () => {
    const mockAccessToken = {
      toString: () =>
        sign(
          {
            ['nhs-notify:client-id']: 'client1',
          },
          'mockToken'
        ),
      payload: {},
    };
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: mockAccessToken,
      },
    });

    const result = await getSessionServer();

    expect(result).toEqual({
      accessToken: mockAccessToken.toString(),
      clientId: 'client1',
    });
  });

  test('getSessionServer - client ID should be undefined if not present on token', async () => {
    const mockAccessToken = {
      toString: () => sign({}, 'mockToken'),
      payload: {},
    };
    fetchAuthSessionMock.mockResolvedValueOnce({
      tokens: {
        accessToken: mockAccessToken,
      },
    });

    const result = await getSessionServer();

    expect(result.clientId).toBeUndefined();
  });

  test('getSessionServer - should return undefined properties when no auth session', async () => {
    fetchAuthSessionMock.mockResolvedValueOnce({});

    const result = await getSessionServer();

    expect(result).toEqual({
      accessToken: undefined,
      clientId: undefined,
    });
  });

  test('getSessionServer - should return undefined properties if an error occurs', async () => {
    fetchAuthSessionMock.mockImplementationOnce(() => {
      throw new Error('JWT Expired');
    });

    const result = await getSessionServer();

    expect(result).toEqual({
      accessToken: undefined,
      clientId: undefined,
    });
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
});
