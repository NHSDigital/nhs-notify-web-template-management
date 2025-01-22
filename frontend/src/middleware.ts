import { NextResponse, type NextRequest } from 'next/server';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { getBasePath } from '@utils/get-base-path';

function isExcludedPath(path: string, excludedPaths: string[]): boolean {
  return excludedPaths.some((excludedPath) => path.startsWith(excludedPath));
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspUnsafeEval =
    process.env.NODE_ENV === 'production' ? '' : `http: 'unsafe-eval'`;

  const csp = `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; default-src 'none'; connect-src 'self'; font-src 'self' https://assets.nhs.uk; img-src 'self'; script-src 'self' 'nonce-${nonce}' ${cspUnsafeEval}; style-src 'self' 'nonce-${nonce}'; upgrade-insecure-requests`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set('Content-Security-Policy', csp);

  requestHeaders.set(
    'x-forwarded-host',
    requestHeaders.get('origin')?.replace('https://', '') || '*'
  );

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
