/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from 'nhs-notify-web-template-management-amplify';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { AMPLIFY_OUTPUTS } from '@utils/amplify-outputs';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: AMPLIFY_OUTPUTS(),
});

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config: AMPLIFY_OUTPUTS(),
    cookies,
    authMode: 'iam',
  });

export async function getAccessTokenServer(): Promise<string | undefined> {
  try {
    const { tokens } = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: fetchAuthSession,
    });

    return tokens?.accessToken?.toString();
  } catch {
    // no-op
  }
}
