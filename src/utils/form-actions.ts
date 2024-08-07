'use server';

import { randomUUID } from 'node:crypto';
import { getAmplifyBackendClient } from '@utils/amplify-utils';

export async function createSession() {
  const { data } = await getAmplifyBackendClient().models.SessionStorage.create(
    {
      sessionId: randomUUID(),
    }
  );

  return data;
}
