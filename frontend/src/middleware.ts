import { NextResponse, type NextRequest } from 'next/server';
import { getAccessTokenServer } from '@utils/amplify-utils';
import { getBasePath } from '@utils/get-base-path';

function isExcludedPath(path: string, excludedPaths: string[]): boolean {
  return excludedPaths.some((excludedPath) => path.startsWith(excludedPath));
}

export async function middleware(request: NextRequest) {
  const excludedPaths = ['/create-and-submit-templates', '/login'];

  if (isExcludedPath(request.nextUrl.pathname, excludedPaths)) {
    return NextResponse.next();
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
