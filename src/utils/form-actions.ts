'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { DbOperationError } from '@domain/errors';
import { Template, Draft } from './types';
import { logger } from './logger';

export async function createTemplate(
  template: Draft<Template>
): Promise<Template> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.create(template);

  if (errors || !data) {
    logger.error('Failed to create template', errors);
    throw new Error('Failed to create new template');
  }
  return data;
}

export async function saveTemplate(template: Template): Promise<Template> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.update(template);

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
  return data;
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

  return data;
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

export async function getTemplates(): Promise<Template[] | []> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.list();

  if (errors) {
    logger.error('Failed to get templates', errors);
  }

  if (!data) {
    logger.warn(`Failed to retrieve templates`);
    return [];
  }

  return data;
}
