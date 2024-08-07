'use server';

import { Session } from './types';
import { getAmplifyBackendClient } from '@utils/amplify-utils';


export async function createSession(session: Omit<Session, 'id'>) {
  const { data } =
    await getAmplifyBackendClient().models.SessionStorage.create(session);

  return data;
}

export async function saveSession(session: Session) {
  const { data } = await getAmplifyBackendClient().models.SessionStorage.update(
    {
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

  return data as Session;
}
