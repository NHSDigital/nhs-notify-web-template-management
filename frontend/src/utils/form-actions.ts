'use server';

import { getAccessTokenServer } from '@utils/amplify-utils';
import {
  CreateTemplate,
  isTemplateDtoValid,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateClient } from 'nhs-notify-backend-client/src/template-api-client';

export async function createTemplate(
  template: CreateTemplate
): Promise<TemplateDto> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await TemplateClient(token).createTemplate(template);

  if (error) {
    logger.error('Failed to create template', { error });
    throw new Error('Failed to create new template');
  }

  return data;
}

export async function saveTemplate(
  template: TemplateDto
): Promise<TemplateDto> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await TemplateClient(token).updateTemplate(
    template.id,
    template
  );

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function getTemplate(
  templateId: string
): Promise<TemplateDto | undefined> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await TemplateClient(token).getTemplate(templateId);

  if (error) {
    logger.error('Failed to get template', { error });
  }

  return data;
}

export async function getTemplates(): Promise<TemplateDto[]> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await TemplateClient(token).listTemplates();

  if (error) {
    logger.error('Failed to get templates', { error });
    return [];
  }

  const sortedData = data
    .map((template) => isTemplateDtoValid(template))
    .filter((template): template is TemplateDto => template !== undefined)
    .sort((a, b) => {
      const aCreatedAt = a.createdAt;
      const bCreatedAt = b.createdAt;

      if (aCreatedAt === bCreatedAt) {
        return a.id.localeCompare(b.id);
      }
      return aCreatedAt < bCreatedAt ? 1 : -1;
    });

  return sortedData;
}
