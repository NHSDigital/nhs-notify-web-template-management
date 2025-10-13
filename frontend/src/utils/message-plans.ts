'use server';

import {
  RoutingConfig,
  $RoutingConfig,
  routingConfigurationApiClient,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { getSessionServer } from './amplify-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { getTemplate } from './form-actions';

export async function getMessagePlan(
  routingConfigId: string
): Promise<RoutingConfig | undefined> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.get(
    accessToken,
    routingConfigId
  );

  if (error) {
    logger.error('Failed to get routing configuration', {
      error: error,
    });
  }

  if (!data) return undefined;

  const result = $RoutingConfig.safeParse(data);

  if (!result.success) {
    logger.error('Invalid routing configuration object', {
      error: result.error,
    });
    return undefined;
  }

  return result.data;
}

export async function updateMessagePlan(
  routingConfigId: string,
  updatedMessagePlan: RoutingConfig
): Promise<RoutingConfig | undefined> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.update(
    accessToken,
    routingConfigId,
    updatedMessagePlan
  );

  if (error) {
    logger.error('Failed to get routing configuration', {
      error: error,
    });
    return;
  }

  if (!data) return undefined;

  const result = $RoutingConfig.safeParse(data);

  if (!result.success) {
    logger.error('Invalid routing configuration object', {
      error: result.error,
    });
    return undefined;
  }

  return result.data;
}

export type MessagePlanTemplates = Record<string, TemplateDto>;

export async function getMessagePlanTemplates(
  messagePlan: RoutingConfig
): Promise<MessagePlanTemplates> {
  const templateIds = getMessagePlanTemplateIds(messagePlan);

  if (templateIds.size === 0) return {};

  return getTemplatesByIds([...templateIds]);
}

export function getMessagePlanTemplateIds(
  messagePlan: RoutingConfig
): Set<string> {
  const templateIds = new Set<string>();

  for (const cascadeItem of messagePlan.cascade) {
    if (cascadeItem.defaultTemplateId)
      templateIds.add(cascadeItem.defaultTemplateId);
    if (cascadeItem.conditionalTemplates) {
      for (const conditionalTemplate of cascadeItem.conditionalTemplates) {
        if (conditionalTemplate.templateId)
          templateIds.add(conditionalTemplate.templateId);
      }
    }
  }

  return templateIds;
}

export async function getTemplatesByIds(templateIds: string[]) {
  const results = await Promise.allSettled(
    templateIds.map(async (templateId) => {
      const template = await getTemplate(templateId);
      return { id: templateId, template };
    })
  );

  const templates: MessagePlanTemplates = {};

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { id, template } = result.value;
      if (template) templates[id] = template;
    } else {
      // TODO: Error handling
    }
  }

  return templates;
}
