'use server';

import { getAccessTokenServer } from '@utils/amplify-utils';
import {
  CreateUpdateTemplate,
  isTemplateDtoValid,
  TemplateDto,
  ValidatedTemplateDto,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { templateClient } from 'nhs-notify-backend-client/src/template-api-client';

export async function createTemplate(
  template: CreateUpdateTemplate
): Promise<TemplateDto> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.createTemplate(template, token);

  if (error) {
    logger.error('Failed to create template', { error });
    throw new Error('Failed to create new template');
  }

  return data;
}

export async function createLetterTemplate(
  template: CreateUpdateTemplate,
  pdf: File,
  csv: File
) {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.createLetterTemplate(
    template,
    token,
    pdf,
    csv?.size > 0 ? csv : undefined
  );

  if (error) {
    logger.error('Failed to create letter template', { error });
    throw new Error('Failed to create new letter template');
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

  const { data, error } = await templateClient.updateTemplate(
    template.id,
    template,
    token
  );

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function setTemplateToSubmitted(
  templateId: string
): Promise<TemplateDto> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.submitTemplate(
    templateId,
    token
  );

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function setTemplateToDeleted(templateId: string): Promise<void> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { error } = await templateClient.deleteTemplate(templateId, token);

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }
}

export async function requestTemplateProof(
  templateId: string
): Promise<TemplateDto> {
  const token = await getAccessTokenServer();

  if (!token) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.requestProof(templateId, token);

  if (error) {
    logger.error('Failed to request proof', { error });
    throw new Error('Failed to request proof');
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

  const { data, error } = await templateClient.getTemplate(templateId, token);

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

  const { data, error } = await templateClient.listTemplates(token);

  if (error) {
    logger.error('Failed to get templates', { error });
    return [];
  }

  const sortedData = data
    .map((template) => isTemplateDtoValid(template))
    .filter(
      (template): template is ValidatedTemplateDto => template !== undefined
    )
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
