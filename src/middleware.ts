import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const idTokenCookie = request.cookies
    .getAll()
    .find(
      (cookie) =>
        cookie.name.includes('CognitoIdentityServiceProvider') &&
        cookie.name.includes('idToken')
    );

  const res = NextResponse.next();
  if (idTokenCookie) {
    res.headers.set('idToken', idTokenCookie.value);
  }

  return res;
}
