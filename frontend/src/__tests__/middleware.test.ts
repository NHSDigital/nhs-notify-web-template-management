/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { getSessionServer } from '@utils/amplify-utils';
import { middleware } from '../middleware';
import { getClientIdFromToken } from '@utils/token-utils';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/token-utils');

const getTokenMock = jest.mocked(getSessionServer);
const getClientIdFromTokenMock = jest.mocked(getClientIdFromToken);

function getCsp(response: Response) {
  const csp = response.headers.get('Content-Security-Policy');
  return csp?.split(';').map((s) => s.trim());
}

const OLD_ENV = { ...process.env };
afterAll(() => {
  process.env = OLD_ENV;
});

beforeEach(() => {
  jest.resetAllMocks();
  getClientIdFromTokenMock.mockImplementation((token) =>
    token ? 'client1' : undefined
  );
});

describe('middleware function', () => {
  it('If route is not registered in middleware, respond with 404', async () => {
    const url = new URL('https://url.com/message-templates/does-not-exist');
    const request = new NextRequest(url);
    const response = await middleware(request);

    expect(response.status).toBe(404);
  });

  it('if request path is protected, and no access/id token is obtained, redirect to auth page', async () => {
    const url = new URL('https://url.com/message-templates');
    const request = new NextRequest(url);
    request.cookies.set('csrf_token', 'some-csrf-value');

    getTokenMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
      idToken: undefined,
    });

    const response = await middleware(request);

    expect(getTokenMock).toHaveBeenCalledWith({ forceRefresh: true });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://url.com/auth?redirect=%2Ftemplates%2Fmessage-templates'
    );
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.cookies.get('csrf_token')?.value).toEqual('');
  });

  it('if request path is protected, tokens exist AND token has client-id, respond with CSP', async () => {
    getTokenMock.mockResolvedValueOnce({
      accessToken: 'access-token',
      clientId: 'client1',
      idToken: 'id-token',
    });

    const url = new URL('https://url.com/message-templates');
    const request = new NextRequest(url);
    const response = await middleware(request);
    const csp = getCsp(response);

    expect(response.status).toBe(200);
    expect(getClientIdFromTokenMock).toHaveBeenCalledTimes(1);

    expect(csp).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'sha256-tDOvXJi1PXbg0CWjLCCYSNHRXtps26K4JXkE3M6u\/c0='$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('if request path is protected, tokens exist BUT token missing client-id, redirect to request-to-be-added page', async () => {
    getTokenMock.mockResolvedValueOnce({
      accessToken: 'access-token',
      idToken: 'id-token',
    });

    getClientIdFromTokenMock.mockReturnValueOnce(undefined);
    getClientIdFromTokenMock.mockReturnValueOnce(undefined);

    const url = new URL('https://url.com/message-templates');
    const request = new NextRequest(url);
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://url.com/auth/request-to-be-added-to-a-service?redirect=%2Ftemplates%2Fmessage-templates'
    );
  });

  it('if request path is not protected, respond with CSP', async () => {
    const url = new URL('https://url.com/create-and-submit-templates');
    const request = new NextRequest(url);
    const response = await middleware(request);
    const csp = getCsp(response);

    expect(response.status).toBe(200);
    expect(csp).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'sha256-tDOvXJi1PXbg0CWjLCCYSNHRXtps26K4JXkE3M6u\/c0='$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('public path (/auth/request-to-be-added-to-a-service) responds with CSP', async () => {
    const url = new URL(
      'https://url.com/auth/request-to-be-added-to-a-service'
    );
    const request = new NextRequest(url);
    const response = await middleware(request);
    const csp = getCsp(response);

    expect(response.status).toBe(200);
    expect(csp).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'sha256-tDOvXJi1PXbg0CWjLCCYSNHRXtps26K4JXkE3M6u\/c0='$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('when running in development mode, CSP script-src allows unsafe-eval and does not upgrade insecure requests', async () => {
    // @ts-expect-error assignment to const
    process.env.NODE_ENV = 'development';

    const url = new URL('https://url.com/create-and-submit-templates');
    const request = new NextRequest(url);
    const response = await middleware(request);
    const csp = getCsp(response);

    expect(csp).toEqual([
      "base-uri 'self'",
      "default-src 'none'",
      "frame-ancestors 'none'",
      "font-src 'self' https://assets.nhs.uk",
      "form-action 'self'",
      "frame-src 'self'",
      "connect-src 'self' https://cognito-idp.eu-west-2.amazonaws.com",
      "img-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      expect.stringMatching(
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'sha256-tDOvXJi1PXbg0CWjLCCYSNHRXtps26K4JXkE3M6u\/c0=' 'unsafe-eval'$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      '',
    ]);
  });
});
