'use server';

import { cookies } from 'next/headers';
import { getSessionId } from '@utils/amplify-utils';
import { generateSessionCsrfToken } from '@utils/csrf-utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const url = request.nextUrl.clone();

  const sessionId = await getSessionId();
  const cookieStore = await cookies();

  if (sessionId) {
    const csrfToken = await generateSessionCsrfToken(sessionId);

    cookieStore.set('csrf_token', csrfToken, {
      sameSite: 'strict',
      secure: true,
    });

    const redirectPath = request.nextUrl.searchParams.get('redirect') ?? '/';
    url.pathname = redirectPath;
    url.searchParams.delete('redirect');
  } else {
    url.pathname = '/auth';
    cookieStore.delete('csrf_token');
  }

  return NextResponse.redirect(url);
};
