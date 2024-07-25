'use server';

import { getAmplifyBackendClient } from '@/src/utils/amplify-utils';
import { Session } from './types';

export async function createSession(session: Session) {
  const { data } =
    await getAmplifyBackendClient().models.SessionStorage.create(session);

  return data;
}

export async function saveSession(sessionId: string, session: Session) {
  const { data } = await getAmplifyBackendClient().models.SessionStorage.update(
    {
      id: sessionId,
      ...session,
    }
  );

  return data;
}

export async function getSession(sessionId: string): Promise<Session> {
  const { data } = await getAmplifyBackendClient().models.SessionStorage.get({
    id: sessionId,
  });

  if (!data) {
    throw new Error('Could not retrieve session');
  }

  return data;
}
