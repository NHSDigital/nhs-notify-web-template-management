/* eslint-disable import/no-unresolved,@typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from 'nhs-notify-web-template-management-amplify';

const config = require('@/amplify_outputs.json');

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config,
    cookies,
    authMode: 'iam',
  });
