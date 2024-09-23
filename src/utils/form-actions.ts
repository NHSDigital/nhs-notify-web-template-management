'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { DbOperationError } from '@domain/errors';
import { Template } from '@domain/templates';
import { randomUUID } from 'node:crypto';
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
  const backendClient = getAmplifyBackendClient();
  const templateRepository = backendClient.models.TemplateStorage;

  const { data, errors } = await templateRepository.create({
    ...template,
    id: `${template.type}-${randomUUID()}`.toLowerCase(),
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
          data: template,
        },
      ],
    });
  }
  return data;
}

export async function sendEmail(
  templateId: string,
  templateName: string,
  templateMessage: string
) {
  const res = await getAmplifyBackendClient().queries.sendEmail({
    // recipientEmail: 'england.test.cm@nhs.net',
    recipientEmail: 'muhammed.salaudeen1@nhs.net',
    templateId,
    templateName,
    templateMessage,
  });

  if (res.errors) {
    logger.error({
      description: 'Error sending email',
      res,
    });
  }
}
