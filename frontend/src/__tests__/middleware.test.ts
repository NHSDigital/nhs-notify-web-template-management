/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { middleware } from '../middleware';

jest.mock('@utils/amplify-utils');

const getTokenMock = jest.mocked(getAccessTokenServer);

function getCsp(response: Response) {
  const csp = response.headers.get('Content-Security-Policy');
  return csp?.split(';').map((s) => s.trim());
}

const OLD_ENV = { ...process.env };
afterAll(() => {
  process.env = OLD_ENV;
});

describe('middleware function', () => {
  it('If route is not registered in middleware, respond with 404', async () => {
    const url = new URL('https://url.com/message-templates/does-not-exist');
    const request = new NextRequest(url);
    const response = await middleware(request);

    expect(response.status).toBe(404);
  });

  it('if request path is protected, and no access token is obtained, redirect to auth page', async () => {
    const url = new URL('https://url.com/message-templates');
    const request = new NextRequest(url);
    request.cookies.set('csrf_token', 'some-csrf-value');

    const response = await middleware(request);

    expect(getTokenMock).toHaveBeenCalledWith({ forceRefresh: true });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://url.com/auth?redirect=%2Ftemplates%2Fmessage-templates'
    );
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.cookies.get('csrf_token')?.value).toEqual('');
  });

  it('if request path is protected, and access token is obtained, respond with CSP', async () => {
    getTokenMock.mockResolvedValueOnce('token');

    const url = new URL('https://url.com/message-templates');
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
      expect.stringMatching(/^script-src 'self' 'nonce-[\dA-Za-z]+'$/),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('if request path is not protected, respond with CSP', async () => {
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
      expect.stringMatching(/^script-src 'self' 'nonce-[\dA-Za-z]+'$/),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });

  it('when running in development mode, CSP script-src allows unsafe-eval', async () => {
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
        /^script-src 'self' 'nonce-[\dA-Za-z]+' 'unsafe-eval'$/
      ),
      expect.stringMatching(/^style-src 'self' 'nonce-[\dA-Za-z]+'$/),
      'upgrade-insecure-requests',
      '',
    ]);
  });
});
