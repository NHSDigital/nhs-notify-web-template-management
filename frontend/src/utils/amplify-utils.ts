/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { FetchAuthSessionOptions, JWT } from 'aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';

const config = require('@/amplify_outputs.json');

export const { runWithAmplifyServerContext } = createServerRunner({
  config,
});

export async function getSessionServer(
  options: FetchAuthSessionOptions = {}
): Promise<{ accessToken: string | undefined; userSub: string | undefined }> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (ctx) => fetchAuthSession(ctx, options),
  }).catch(() => {
    // no-op
  });

  return {
    accessToken: session?.tokens?.accessToken?.toString(),
    userSub: session?.userSub,
  };
}

export const getSessionId = async () => {
  return getAccessTokenParam('origin_jti');
};

export const getClientId = async (accessToken?: string) => {
  return getAccessTokenParam('nhs-notify:client-id', accessToken);
};

const getAccessTokenParam = async (key: string, accessToken?: string) => {
  accessToken ??= (await getSessionServer()).accessToken

  if (!accessToken) {
    return;
  }

  const jwt = jwtDecode<JWT['payload']>(accessToken);

  const value = jwt[key]

  if (!value) {
    return;
  }

  return value.toString();
}
