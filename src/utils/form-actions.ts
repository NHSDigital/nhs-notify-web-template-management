'use server';

import { randomUUID } from 'node:crypto';
import { getAmplifyBackendClient } from '@/src/utils/amplify-utils';

export async function createSession() {
  if (process.env.CI === 'true') {
    return;
  }

  const { data } = await getAmplifyBackendClient().models.SessionStorage.create(
    {
      sessionId: randomUUID(),
    }
  );

  return data;
}

export async function getState(sessionId: string) {
  const response = await getAmplifyBackendClient().models.SessionStorage.get({
    id: sessionId,
  });

  return response.data;
}
