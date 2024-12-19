/* eslint-disable array-callback-return */

'use server';

import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { DbOperationError } from '@domain/errors';
import {
  Template,
  Draft,
  isTemplateValid,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export async function createTemplate(
  template: Draft<Template>
): Promise<Template> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.create(template);

  if (errors || !data) {
    logger.error('Failed to create template', errors, template);
    throw new Error('Failed to create new template');
  }
  return data;
}

export async function saveTemplate(
  template: Template,
  ttl?: number // remove ttl after we get rid of Amplify backend, our own API will handle the TTLs without input from the client
): Promise<Template> {
  const { data, errors } =
    await getAmplifyBackendClient().models.TemplateStorage.update({
      ...template,
      ...(ttl && { ttl }),
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

  const parsedData: Template[] = data
    .map((template) => isTemplateValid(template))
    .filter(
      (template): template is Template =>
        template !== undefined &&
        template.templateStatus !== TemplateStatus.DELETED
    )
    .sort((a, b) => {
      const aCreatedAt = a.createdAt ?? '';
      const bCreatedAt = b.createdAt ?? '';

      if (aCreatedAt === bCreatedAt) {
        return a.id.localeCompare(b.id);
      }
      return aCreatedAt < bCreatedAt ? 1 : -1;
    });

  return parsedData;
}
