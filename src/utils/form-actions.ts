'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { TemplateStorage } from 'amplify/data/models/template-storage.model';
import { Session } from './types';
import { logger } from './logger';
import { Template, TemplateFields } from '../domain/templates/template';

export async function createSession(session: Omit<Session, 'id'>) {
  const { data, errors } =
    await getAmplifyBackendClient().models.SessionStorage.create(session);
  if (errors) {
    logger.error('Failed to create session', errors);
    throw new Error('Failed to create new template');
  }
  return data;
}

export async function saveSession(session: Session) {
  const { data, errors } =
    await getAmplifyBackendClient().models.SessionStorage.update(session);
  if (errors) {
    logger.error('Failed to save session', errors);
    throw new Error('Failed to save template data');
  }
  return data;
}

export async function getSession(
  sessionId: string
): Promise<Session | undefined> {
  const { data, errors } =
    await getAmplifyBackendClient().models.SessionStorage.get({
      id: sessionId,
    });
  if (errors) {
    logger.error('Failed to get session', errors);
  }

  if (!data) {
    logger.warn(`Failed to retrieve session for ID ${sessionId}`);
    return undefined;
  }
  return data as Session;
}

export async function saveTemplate<TFields extends TemplateFields>(
  template: Template<TFields>
) {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.create(template);

  return {
    // TODO: I'd much rather being able todo this using satisfies rather than as...
    data: data as TemplateStorage<TFields>,
    errors,
  };
}
