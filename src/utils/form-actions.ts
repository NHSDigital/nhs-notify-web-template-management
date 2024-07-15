'use server';

import { randomUUID } from 'node:crypto';
import { cookieBasedClient } from '@/src/utils/amplify-utils';

export async function createSession() {
  const { data } = await cookieBasedClient.models.BackendSessionPOC.create({
    sessionId: randomUUID(),
  });

  return data;
}
