/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';

const config = require('@/amplify_outputs.json');

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config: process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true' ? {} : config,
    cookies,
    authMode: 'iam',
  });
