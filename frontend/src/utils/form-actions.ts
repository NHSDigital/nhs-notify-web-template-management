'use server';

import { getSessionServer } from '@utils/amplify-utils';
import {
  CreateUpdateTemplate,
  isTemplateDtoValid,
  RoutingConfig,
  TemplateDto,
  ValidatedTemplateDto,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { templateApiClient } from 'nhs-notify-backend-client/src/template-api-client';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client/src/routing-config-api-client';
import { sortAscByUpdatedAt } from './sort';

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
    logger.error('Failed to create template', error);
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
    logger.error('Failed to create letter template', error);
    throw new Error('Failed to create new letter template');
  }

  return data;
}

export async function saveTemplate(
  templateId: string,
  template: Extract<TemplateDto, { templateType: 'EMAIL' | 'SMS' | 'NHS_APP' }>
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.updateTemplate(
    templateId,
    template,
    accessToken,
    template.lockNumber
  );

  if (error) {
    logger.error('Failed to save template', error);
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function setTemplateToSubmitted(
  templateId: string,
  lockNumber: number
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.submitTemplate(
    templateId,
    accessToken,
    lockNumber
  );

  if (error) {
    logger.error('Failed to save template', error);
    throw new Error('Failed to save template data');
  }

  return data;
}

export async function setTemplateToDeleted(
  templateId: string,
  lockNumber: number
): Promise<void> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { error } = await templateApiClient.deleteTemplate(
    templateId,
    accessToken,
    lockNumber
  );

  if (error) {
    logger.error('Failed to save template', error);
    throw new Error('Failed to save template data');
  }
}

export async function requestTemplateProof(
  templateId: string,
  lockNumber: number
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.requestProof(
    templateId,
    accessToken,
    lockNumber
  );

  if (error) {
    logger.error('Failed to request proof', error);
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
    logger.error('Failed to get template', error);
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

  return sortAscByUpdatedAt(sortedData);
}

export async function createRoutingConfig(
  routingConfig: Pick<
    RoutingConfig,
    'name' | 'campaignId' | 'cascade' | 'cascadeGroupOverrides'
  >
): Promise<RoutingConfig> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.create(
    routingConfig,
    accessToken
  );

  if (error) {
    logger.error('Failed to create message plan', { error });
    throw new Error('Failed to create message plan');
  }

  return data;
}
