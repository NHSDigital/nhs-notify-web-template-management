'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { NHSAppTemplate, Template } from '@domain/templates';
import { DbOperationError } from '@domain/errors';
import { Session } from './types';
import { logger } from './logger';

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

export async function saveTemplate(template: Omit<Template, 'id'>) {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.create({
      ...template,
    });

  if (errors) {
    throw new DbOperationError({
      message: `Failed saving ${template.type} template`,
      operation: 'create',
      cause: errors,
    });
  }

  if (!data) {
    throw new DbOperationError({
      message: `${template.type} template entity in unknown state. No errors reported but entity returned as falsy`,
      operation: 'create',
      cause: [
        {
          message: 'Fields attempting to be saved',
          data: template, // TODO: is this okay to be logged out? There shouldn't be any PID in the template?
        },
      ],
    });
  }

  return data;
}
