import { cookies } from 'next/headers';
import fs from 'node:fs';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';

export const config = () => {
  try {
    const output = fs.readFileSync('../../amplify_outputs.json', 'utf8');
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
