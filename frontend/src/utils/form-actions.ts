'use server';

import { getAccessTokenServer } from '@utils/amplify-utils';
import { Template, Draft } from 'nhs-notify-web-template-management-utils';
import { BackendClient, TemplateDTO } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export async function createTemplate(
  template: Draft<Template>
): Promise<Template | TemplateDTO> {
  const token = await getAccessTokenServer();

  // String(token) is temporary
  const { data, error } = await BackendClient(
    String(token)
  ).templates.createTemplate(template);

  if (error) {
    logger.error('Failed to create template', error);
    throw new Error('Failed to create new template');
  }

  return data;
}

export async function saveTemplate(
  template: Template
): Promise<Template | TemplateDTO> {
  const token = await getAccessTokenServer();

  // String(token) is temporary
  const { data, error } = await BackendClient(
    String(token)
  ).templates.updateTemplate(template.id, template);

  if (error) {
    logger.error('Failed to save template', error);
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function getTemplate(
  templateId: string
): Promise<Template | TemplateDTO | undefined> {
  const token = await getAccessTokenServer();

  // String(token) is temporary
  const { data, error } = await BackendClient(
    String(token)
  ).templates.getTemplate(templateId);

  if (error) {
    logger.error('Failed to get template', error);
  }

  return data;
}

export async function sendEmail(templateId: string) {
  const token = await getAccessTokenServer();

  // String(token) is temporary
  const { error } = await BackendClient(String(token)).functions.sendEmail(
    templateId
  );

  if (error) {
    logger.error({
      description: 'Error sending email',
      error,
    });
  }
}

export async function getTemplates(): Promise<Template[] | TemplateDTO[]> {
  const token = await getAccessTokenServer();

  // String(token) is temporary
  const { data, error } = await BackendClient(
    String(token)
  ).templates.listTemplates();

  if (error) {
    logger.error('Failed to get templates', error);
    return [];
  }

  const sortedData = data.sort((a, b) => {
    const aCreatedAt = a.createdAt ?? '';
    const bCreatedAt = b.createdAt ?? '';

    if (aCreatedAt === bCreatedAt) {
      return a.id.localeCompare(b.id);
    }
    return aCreatedAt < bCreatedAt ? 1 : -1;
  });

  return sortedData;
}
