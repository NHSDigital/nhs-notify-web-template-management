'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { Session } from './types';
import { logger } from './logger';

export async function createSession(session: Omit<Session, 'id'>) {
  const { data } =
    await getAmplifyBackendClient().models.SessionStorage.create(session);
  return data;
}

export async function saveSession(session: Session) {
  const { data } =
    await getAmplifyBackendClient().models.SessionStorage.update(session);
  return data;
}

export async function getSession(
  sessionId: string
): Promise<Session | undefined> {
  const { data } = await getAmplifyBackendClient().models.SessionStorage.get({
    id: sessionId,
  });

  if (!data) {
    logger.warn(`Failed to retrieve session for ID ${sessionId}`);
    return undefined;
  }
  return data as Session;
}
