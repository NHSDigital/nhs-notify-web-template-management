/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies, headers } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';
import { getAmplifyOutputs } from './get-amplify-outputs';

const config = getAmplifyOutputs();

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config,
    cookies,
    authMode: 'userPool',
    authToken: headers().get('idToken') ?? undefined,
  });
