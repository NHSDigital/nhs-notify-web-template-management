'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { DbOperationError } from '@domain/errors';
import { Template } from './types';
import { logger } from './logger';

const calculateTTL = () => {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  const maxTTLDurationInSeconds = Number.parseInt(
    process.env.MAX_TTL_DURATION_IN_SECONDS ?? '432000',
    10
  ); // 5 days in seconds

  return currentTimeSeconds + maxTTLDurationInSeconds;
};

export async function createTemplate(template: Omit<Template, 'id'>) {
  const templateWithTTL = {
    ...template,
    ttl: calculateTTL(),
  };
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.create(
      templateWithTTL
    );

  if (errors) {
    logger.error('Failed to create template', errors);
    throw new Error('Failed to create new template');
  }
  return data;
}

export async function saveTemplate(template: Template, ttl = false) {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.update({
      ...template,
      ...(ttl && { ttl: calculateTTL() }),
    });

  if (errors) {
    logger.error('Failed to save template', errors);
    throw new Error('Failed to save template data');
  }

  if (!data) {
    throw new DbOperationError({
      message:
        'Template in unknown state. No errors reported but entity returned as falsy',
      operation: 'update',
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

  return data as Template;
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
