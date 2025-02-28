'use server';

import { getAccessTokenServer } from '@utils/amplify-utils';
import {
  Template,
  isTemplateValid,
} from 'nhs-notify-web-template-management-utils';
import {
  CreateLetterTemplate,
  CreateTemplate,
  TemplateDTO,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateClient } from 'nhs-notify-backend-client/src/template-api-client';

export async function createTemplate(
  template: CreateTemplate
): Promise<TemplateDTO> {
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

export async function createLetterTemplate(
  template: CreateLetterTemplate,
  pdf: File,
  csv: File
): Promise<TemplateDTO> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await TemplateClient(token).createLetterTemplate(
    template,
    pdf,
    csv
  );

  if (error) {
    logger.error('Failed to create template', { error });
    throw new Error('Failed to create new template');
  }

  return data;
}

export async function saveTemplate(template: Template): Promise<TemplateDTO> {
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
): Promise<TemplateDTO | undefined> {
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

export async function getTemplates(): Promise<TemplateDTO[]> {
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
    .map((template) => isTemplateValid(template))
    .filter((template): template is TemplateDTO => template !== undefined)
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
