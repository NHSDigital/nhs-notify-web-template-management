'use server';

import { getSessionServer } from '@utils/amplify-utils';
import {
  $TemplateDto,
  CreateUpdateTemplate,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { templateApiClient } from 'nhs-notify-backend-client/src/template-api-client';
import { sortAscByUpdatedAt } from './sort';
import { TemplateFilter } from 'nhs-notify-backend-client/src/types/filters';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

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

export async function getTemplates(
  filters?: TemplateFilter
): Promise<TemplateDto[]> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.listTemplates(
    accessToken,
    filters
  );

  if (error) {
    logger.error('Failed to get templates', { error });
    return [];
  }

  const valid = data.filter((d) => {
    const { error: validationError, success } = $TemplateDto.safeParse(d);

    if (!success) {
      logger.error('Listed invalid template', validationError);
    }

    return success;
  });

  return sortAscByUpdatedAt(valid);
}

/**
 * Gets all foreign language (non-English) letter templates
 * This currently fetches all LETTER templates and filters to non-English
 * Will need updating once pagination is implemented in the backend
 */
export async function getForeignLanguageLetterTemplates(): Promise<
  LetterTemplate[]
> {
  const allLetterTemplates = (await getTemplates({
    templateType: 'LETTER',
    letterType: 'x0',
  })) as LetterTemplate[];

  return allLetterTemplates.filter(
    (template) => 'language' in template && template.language !== 'en'
  );
}
