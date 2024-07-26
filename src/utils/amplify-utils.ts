import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { Schema } from '../../amplify/data/resource';
import config from '../../amplify_outputs.json';


export const getAmplifyBackendClient = () =>
  generateServerClientUsingCookies<Schema>({
    config: config,
    cookies,
  });
