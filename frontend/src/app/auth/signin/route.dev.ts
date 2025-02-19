'use server';

import { generateCsrf } from '@utils/csrf-utils';
import { cookies } from 'next/headers';
import { getBasePath } from '@utils/get-base-path';

export const GET = async (request: Request) => {
  const redirectPath = new URL(request.url).searchParams.get('redirect') ?? '/';

  const csrfToken = await generateCsrf();

  const resJson = { csrfToken };

  const cookieStore = await cookies();
  cookieStore.set('csrf_token', csrfToken);

  return Response.json(resJson, {
    status: 302,
    headers: {
      Location: `${getBasePath()}${redirectPath}`,
    },
  });
};
