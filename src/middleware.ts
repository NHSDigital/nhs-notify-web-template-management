import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const { url } = req;

  console.log(url);

  if (!basicAuth) {
    return new Response('Authentication Required!', {
      status: 401,
      headers: {
        'WWW-Authenticate': "Basic realm='private_pages'",
      },
    });
  }

  const authValue = basicAuth.split(' ')[1];

  const [user, pwd] = atob(authValue ?? '').split(':');

  if (user === 'bob' && pwd === 'hello') {
    return NextResponse.next();
  }
}
