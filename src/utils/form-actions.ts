'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { DbOperationError } from '@domain/errors';
import { Template, $Template } from '@domain/templates';
import { randomUUID } from 'node:crypto';
import { Session } from './types';
import { logger } from './logger';

const calculateTTL = () => {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  const maxSessionLengthInSeconds = Number.parseInt(
    process.env.MAX_SESSION_LENGTH_IN_SECONDS ?? '432000',
    10
  ); // 5 days in seconds

  return currentTimeSeconds + maxSessionLengthInSeconds;
};

export async function createSession(session: Omit<Session, 'id'>) {
  const sessionWithTTL = {
    ...session,
    ttl: calculateTTL(),
  };
  const { data, errors } =
    await getAmplifyBackendClient().models.SessionStorage.create(
      sessionWithTTL
    );

  if (errors) {
    logger.error('Failed to create session', errors);
    throw new Error('Failed to create new template');
  }
  return data;
}

export async function saveSession(session: Session) {
  const { data, errors } =
    await getAmplifyBackendClient().models.SessionStorage.update({
      ...session,
      ttl: calculateTTL(),
    });

  if (errors) {
    logger.error('Failed to save session', errors);
    throw new Error('Failed to save template data');
  }
  if (!data) {
    throw new DbOperationError({
      message:
        'Session in unknown state. No errors reported but entity returned as falsy',
      operation: 'update',
    });
  }
  return data as Session;
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
  return data as Template;
}

export async function getTemplate(
  templateId: string
): Promise<Template | undefined> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.get({
      id: templateId,
    });

  if (errors) {
    logger.error('Failed to get template', errors);
  }

  if (!data) {
    logger.warn(`Failed to retrieve template for ID ${templateId}`);
    return undefined;
  }

  return $Template.parse(data);
}

export async function sendEmail(
  templateId: string,
  templateName: string,
  templateMessage: string,
  templateSubjectLine: string | null
) {
  const res = await getAmplifyBackendClient().queries.sendEmail({
    recipientEmail: 'england.test.cm@nhs.net',
    templateId,
    templateName,
    templateMessage,
    templateSubjectLine,
  });

  if (res.errors) {
    logger.error({
      description: 'Error sending email',
      res,
    });
  }
}

export async function deleteSession(sessionId: string) {
  const backendClient = getAmplifyBackendClient();
  const sessionRepository = backendClient.models.SessionStorage;

  const { errors } = await sessionRepository.delete({
    id: sessionId,
  });

  if (errors) {
    logger.warn(
      `Failed to delete session ${sessionId} `,
      new DbOperationError({
        message: `Failed to delete session ${sessionId} `,
        operation: 'delete',
        cause: errors,
      })
    );
    return false;
  }

  return true;
}

export async function getTemplates(): Promise<Template[] | []> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.list();

  if (errors) {
    logger.error('Failed to get template', errors);
  }

  if (!data) {
    logger.warn(`Failed to retrieve templates`);
    return [];
  }

  const parsedData = data.map((template) => $Template.parse(template));

  return parsedData;
}
