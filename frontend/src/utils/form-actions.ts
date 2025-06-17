'use server';

import { getClientId, getSessionServer } from '@utils/amplify-utils';
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
  const { accessToken, userSub } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const clientId = await getClientId(accessToken)
  const userId = userSub

  if (!clientId || !userId) {
    throw new Error('Missing configuration')
  }

  const templateWithAdditionalProperties: CreateUpdateTemplate = {
    ...template,
    clientId,
    userId
  }

  const { data, error } = await templateClient.createTemplate(
    templateWithAdditionalProperties,
    accessToken
  );

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
  const { accessToken, userSub } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const clientId = await getClientId(accessToken)
  const userId = userSub

  if (!clientId || !userId) {
    throw new Error('Missing configuration')
  }

  const templateWithAdditionalProperties = {
    ...template,
    clientId,
    userId
  }

  const { data, error } = await templateClient.createLetterTemplate(
    templateWithAdditionalProperties,
    accessToken,
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
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.updateTemplate(
    template.id,
    template,
    accessToken
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
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.submitTemplate(
    templateId,
    accessToken
  );

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function setTemplateToDeleted(templateId: string): Promise<void> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { error } = await templateClient.deleteTemplate(
    templateId,
    accessToken
  );

  if (error) {
    logger.error('Failed to save template', { error });
    throw new Error('Failed to save template data');
  }
}

export async function requestTemplateProof(
  templateId: string
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.requestProof(
    templateId,
    accessToken
  );

  if (error) {
    logger.error('Failed to request proof', { error });
    throw new Error('Failed to request proof');
  }

  return data;
}

export async function getTemplate(
  templateId: string
): Promise<TemplateDto | undefined> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.getTemplate(
    templateId,
    accessToken
  );

  if (error) {
    logger.error('Failed to get template', { error });
  }

  return data;
}

export async function getTemplates(): Promise<TemplateDto[]> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateClient.listTemplates(accessToken);

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
