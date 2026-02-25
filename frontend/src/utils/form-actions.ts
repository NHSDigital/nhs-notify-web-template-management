'use server';

import { getSessionServer } from '@utils/amplify-utils';
import { $TemplateDto } from 'nhs-notify-backend-client';
import type {
  CreateUpdateTemplate,
  PatchTemplate,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
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

export async function patchTemplate(
  templateId: string,
  template: PatchTemplate,
  lockNumber: number
): Promise<TemplateDto> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await templateApiClient.patchTemplate(
    templateId,
    template,
    accessToken,
    lockNumber
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

    if (
      error.errorMeta?.details &&
      typeof error.errorMeta.details === 'object' &&
      'errorCode' in error.errorMeta.details &&
      error.errorMeta.details.errorCode === 'TEMPLATE_IN_USE'
    ) {
      throw new Error('TEMPLATE_IN_USE');
    }

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
 */
export async function getForeignLanguageLetterTemplates(
  filters?: TemplateFilter
): Promise<LetterTemplate[]> {
  return (await getTemplates({
    templateType: 'LETTER',
    letterType: 'x0',
    excludeLanguage: 'en',
    ...filters,
  })) as LetterTemplate[];
}
