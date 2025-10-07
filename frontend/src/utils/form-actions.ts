'use server';

import { getSessionServer } from '@utils/amplify-utils';
import {
  CreateUpdateTemplate,
  isTemplateDtoValid,
  RoutingConfig,
  RoutingConfigStatusActive,
  routingConfigurationApiClient,
  TemplateDto,
  ValidatedTemplateDto,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { templateApiClient } from 'nhs-notify-backend-client/src/template-api-client';
import { sortAscByCreatedAt } from './sort';

export async function createTemplate(
  template: CreateUpdateTemplate
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.createTemplate(
    template,
    accessToken
  );

  if (error) {
    logger.error('Failed to create template', { error });
    throw new Error('Failed to create new template');
  }

  return data;
}

export async function uploadLetterTemplate(
  template: CreateUpdateTemplate,
  pdf: File,
  csv: File
) {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.uploadLetterTemplate(
    template,
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
  template: Extract<TemplateDto, { templateType: 'EMAIL' | 'SMS' | 'NHS_APP' }>
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.updateTemplate(
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

  const { data, error } = await templateApiClient.submitTemplate(
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

  const { error } = await templateApiClient.deleteTemplate(
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

  const { data, error } = await templateApiClient.requestProof(
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

  const { data, error } = await templateApiClient.getTemplate(
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

  const { data, error } = await templateApiClient.listTemplates(accessToken);

  if (error) {
    logger.error('Failed to get templates', { error });
    return [];
  }

  const sortedData = data
    .map((template) => isTemplateDtoValid(template))
    .filter(
      (template): template is ValidatedTemplateDto => template !== undefined
    );

  return sortAscByCreatedAt(sortedData);
}

export async function getRoutingConfigs(): Promise<RoutingConfig[]> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.list(accessToken);

  if (error) {
    logger.error('Failed to get routing configuration', {
      error: error,
    });
    return [];
  }

  return sortAscByCreatedAt(data);
}

export async function countRoutingConfigs(
  status: RoutingConfigStatusActive
): Promise<number> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.count(
    accessToken,
    status
  );

  if (error) {
    logger.error(`Failed to count routing configuration for ${status}`, {
      error,
    });
    return 0;
  }

  return data.count;
}
