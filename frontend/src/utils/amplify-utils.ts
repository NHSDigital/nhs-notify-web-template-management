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
): Promise<{
  accessToken?: string;
  idToken?: string;
  clientId?: string;
  clientName?: string;
  displayName?: string;
}> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (ctx) => fetchAuthSession(ctx, options),
  }).catch(() => {
    // no-op
  });

  const accessToken = session?.tokens?.accessToken?.toString();
  const clientId = accessToken && getClientId(accessToken);

  const idToken = session?.tokens?.idToken?.toString();
  const idClaims = idToken ? getIdTokenClaims(idToken) : undefined;

  return {
    accessToken,
    idToken,
    clientId,
    clientName: idClaims?.clientName,
    displayName: idClaims?.displayName,
  };
}

export const getSessionId = async () => {
  return getAccessTokenParam('origin_jti');
};

export const getClientId = (accessToken: string) => {
  return getClaim(decodeJwt(accessToken), 'nhs-notify:client-id');
};

const getAccessTokenParam = async (key: string) => {
  const authSession = await getSessionServer();
  const accessToken = authSession.accessToken;

  if (!accessToken) return;

  return getClaim(decodeJwt(accessToken), key);
};

const decodeJwt = (token: string): JWT['payload'] =>
  jwtDecode<JWT['payload']>(token);

const getClaim = (claims: JWT['payload'], key: string): string | undefined => {
  const value = claims[key];
  return value != null ? String(value) : undefined;
};

const getIdTokenClaims = (
  idToken: string
): {
  clientName?: string;
  displayName?: string;
} => {
  const claims = decodeJwt(idToken);

  const clientName = getClaim(claims, 'nhs-notify:client-name');

  let displayName;

  const preferredUsername =
    getClaim(claims, 'preferred_username') || getClaim(claims, 'display_name');

  if (preferredUsername) displayName = preferredUsername;
  else {
    const givenName = getClaim(claims, 'given_name');
    const familyName = getClaim(claims, 'family_name');

    if (givenName && familyName) displayName = `${givenName} ${familyName}`;
    else {
      const email = getClaim(claims, 'email');
      if (email) displayName = email;
    }
  }

  return {
    clientName,
    displayName,
  };
};
