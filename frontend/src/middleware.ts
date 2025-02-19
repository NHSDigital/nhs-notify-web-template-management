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
    'script-src': [`'self'`, `'nonce-${nonce}'`],
    'style-src': [`'self'`, `'nonce-${nonce}'`],
    'upgrade-insecure-requests;': [],
  };

  if (process.env.NODE_ENV === 'development') {
    contentSecurityPolicyDirective['script-src'].push(`'unsafe-eval'`);
  }

  return Object.entries(contentSecurityPolicyDirective)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');
}

function isPublicPath(path: string, publicPaths: string[]): boolean {
  return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = getContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  const publicPaths = ['/create-and-submit-templates', '/auth', '/lib'];

  if (isPublicPath(request.nextUrl.pathname, publicPaths)) {
    const publicPathResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    publicPathResponse.headers.set('Content-Security-Policy', csp);

    return publicPathResponse;
  }

  const token = await getAccessTokenServer();

  if (!token) {
    const redirectResponse = NextResponse.redirect(
      new URL(
        `/auth?redirect=${encodeURIComponent(
          `${getBasePath()}${request.nextUrl.pathname}`
        )}`,
        request.url
      )
    );

    redirectResponse.headers.set('Content-Type', 'text/html');

    return redirectResponse;
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
     * - lib/ (our static content)
     */
    '/((?!_next/static|_next/image|favicon.ico|lib/).*)',
  ],
};
