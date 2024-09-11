/* eslint-disable import/no-unresolved */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';

const config = require('@/amplify_outputs.json');

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config,
    cookies,
    authMode: 'iam',
  });

type AmplifyClient = ReturnType<typeof getAmplifyBackendClient>;

export type SessionClient = AmplifyClient['models']['SessionStorage'];

export const getSessionClient = (): SessionClient =>
  getAmplifyBackendClient().models.SessionStorage;
