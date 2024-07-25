import { cookies } from 'next/headers';
import { readFileSync } from 'node:fs';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';

export const config = () => {
  try {
    const output = readFileSync('amplify_outputs.json', 'utf8');
    return JSON.parse(output);
  } catch {
    return {};
  }
};

export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config: config(),
    cookies,
  });
