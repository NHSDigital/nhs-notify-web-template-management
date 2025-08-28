import { NextResponse, type NextRequest } from 'next/server';
import { getSessionServer } from '@utils/amplify-utils';
import { getBasePath } from '@utils/get-base-path';
import { getClientIdFromToken } from '@utils/token-utils';

const protectedPaths = [
  /^\/choose-a-template-type$/,
  /^\/copy-template\/[^/]+$/,
  /^\/create-email-template$/,
  /^\/create-nhs-app-template$/,
  /^\/create-text-message-template$/,
  /^\/delete-template\/[^/]+$/,
  /^\/edit-email-template\/[^/]+$/,
  /^\/edit-letter-template\/[^/]+$/,
  /^\/edit-nhs-app-template\/[^/]+$/,
  /^\/edit-text-message-template\/[^/]+$/,
  /^\/email-template-submitted\/[^/]+$/,
  /^\/invalid-template$/,
  /^\/letter-template-submitted\/[^/]+$/,
  /^\/message-templates$/,
  /^\/nhs-app-template-submitted\/[^/]+$/,
  /^\/preview-email-template\/[^/]+$/,
  /^\/preview-letter-template\/[^/]+$/,
  /^\/preview-nhs-app-template\/[^/]+$/,
  /^\/preview-submitted-email-template\/[^/]+$/,
  /^\/preview-submitted-letter-template\/[^/]+$/,
  /^\/preview-submitted-nhs-app-template\/[^/]+$/,
  /^\/preview-submitted-text-message-template\/[^/]+$/,
  /^\/preview-text-message-template\/[^/]+$/,
  /^\/request-proof-of-template\/[^/]+$/,
  /^\/submit-email-template\/[^/]+$/,
  /^\/submit-letter-template\/[^/]+$/,
  /^\/submit-nhs-app-template\/[^/]+$/,
  /^\/submit-text-message-template\/[^/]+$/,
  /^\/text-message-template-submitted\/[^/]+$/,
  /^\/upload-letter-template\/client-id-and-campaign-id-required$/,
  /^\/upload-letter-template$/,
];

const publicPaths = [
  /^\/create-and-submit-templates$/,
  /^\/auth$/,
  /^\/auth\/signin$/,
  /^\/auth\/signout$/,
  /^\/auth\/idle$/,
  /^\/auth\/request-to-be-added-to-a-service$/,
];

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = getContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  if (publicPaths.some((p) => p.test(pathname))) {
    const publicPathResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    publicPathResponse.headers.set('Content-Security-Policy', csp);

    return publicPathResponse;
  }

  if (!protectedPaths.some((p) => p.test(pathname))) {
    return new NextResponse('Page not found', { status: 404 });
  }

  const { accessToken, idToken } = await getSessionServer({
    forceRefresh: true,
  });

  if (!accessToken || !idToken) {
    const path = `${getBasePath()}${pathname}`;

    const redirectResponse = NextResponse.redirect(
      new URL(`/auth?redirect=${encodeURIComponent(path)}`, request.url)
    );

    redirectResponse.headers.set('Content-Type', 'text/html');

    redirectResponse.cookies.delete('csrf_token');

    return redirectResponse;
  }

  const hasClientId =
    getClientIdFromToken(accessToken) || getClientIdFromToken(idToken);

  if (!hasClientId) {
    const missingClientIdRedirect = new URL(
      `/auth/request-to-be-added-to-a-service?redirect=${encodeURIComponent(
        `${getBasePath()}${pathname}`
      )}`,
      request.url
    );
    const redirectResponse = NextResponse.redirect(missingClientIdRedirect);

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
     * - test files
     */
    '/((?!_next/static|_next/image|favicon.ico|lib/|testing).*)',
  ],
};
