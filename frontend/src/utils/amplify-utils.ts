/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';

const config = require('@/amplify_outputs.json');

export const { runWithAmplifyServerContext } = createServerRunner({
  config,
});

export async function getAccessTokenServer(): Promise<string | undefined> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (spec) => fetchAuthSession(spec, { forceRefresh: true }),
  }).catch(() => {
    /* no-op */
  });

  return session?.tokens?.accessToken?.toString();
}
