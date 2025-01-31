import { NextResponse, type NextRequest } from 'next/server';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { getBasePath } from '@utils/get-base-path';

function getContentSecurityPolicy(nonce: string) {
  const contentSecurityPolicyDirective = {
    'base-uri': [`'self'`],
    'default-src': [`'none'`],
    'frame-ancestors': [`'none'`],
    'font-src': [`'self'`, 'https://assets.nhs.uk'],
    'form-action': [`'self'`],
    'frame-src': [`'self'`],
    'connect-src': [`'self'`, 'https://cognito-idp.eu-west-2.amazonaws.com'],
    'img-src': [`'self'`],
    'manifest-src': [`'self'`],
    'object-src': [`'none'`],
    'script-src': [`'nonce-${nonce}'`, `'strict-dynamic'`],
    'style-src': [`'self'`],
    'upgrade-insecure-requests;': [],
  };

  if (process.env.NODE_ENV === 'development') {
    contentSecurityPolicyDirective['script-src'].push(`'unsafe-eval'`);
  }

  return Object.entries(contentSecurityPolicyDirective)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');
}

function isExcludedPath(path: string, excludedPaths: string[]): boolean {
  return excludedPaths.some((excludedPath) => path.startsWith(excludedPath));
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = getContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set('Content-Security-Policy', csp);

  // requestHeaders.set(
  //   'x-forwarded-host',
  //   requestHeaders.get('origin')?.replace('https://', '') || '*'
  // );

  const excludedPaths = ['/create-and-submit-templates', '/auth'];

  if (isExcludedPath(request.nextUrl.pathname, excludedPaths)) {
    const excludedPathResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    excludedPathResponse.headers.set('Content-Security-Policy', csp);

    return excludedPathResponse;
  }

  const token = await getAccessTokenServer();

  if (!token) {
    return Response.redirect(
      new URL(
        `/auth?redirect=${encodeURIComponent(
          `${getBasePath()}/${request.nextUrl.pathname}`
        )}`,
        request.url
      )
    );
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
