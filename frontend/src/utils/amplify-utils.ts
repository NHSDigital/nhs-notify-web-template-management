/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { FetchAuthSessionOptions } from 'aws-amplify/auth';
import { decodeJwt, getClaim, getClientIdFromToken } from './token-utils';

const config = require('@/amplify_outputs.json');

export const { runWithAmplifyServerContext } = createServerRunner({
  config,
});

export type Session = {
  accessToken?: string;
  idToken?: string;
  clientId?: string;
};

export async function getSessionServer(
  options: FetchAuthSessionOptions = {}
): Promise<Session> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (ctx) => fetchAuthSession(ctx, options),
  }).catch(() => {
    // no-op
  });

  const accessToken = session?.tokens?.accessToken?.toString();
  const clientId = accessToken && getClientIdFromToken(accessToken);

  const idToken = session?.tokens?.idToken?.toString();

  return {
    accessToken,
    idToken,
    clientId,
  };
}

const getAccessTokenParam = async (key: string) => {
  const authSession = await getSessionServer();
  const accessToken = authSession.accessToken;

  if (!accessToken) return;

  return getClaim(decodeJwt(accessToken), key);
};

export const getSessionId = async () => {
  return getAccessTokenParam('origin_jti');
};
