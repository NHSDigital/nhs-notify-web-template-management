'use server';

import {
  RoutingConfig,
  $RoutingConfig,
  routingConfigurationApiClient,
  TemplateDto,
  RoutingConfigStatusActive,
} from 'nhs-notify-backend-client';
import { getMessagePlanTemplateIds } from './get-message-plan-template-ids';
import { getSessionServer } from './amplify-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { getTemplate } from './form-actions';
import { sortAscByUpdatedAt } from './sort';

export async function getRoutingConfigs(): Promise<RoutingConfig[]> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.list(accessToken);

  if (error) {
    logger.error('Failed to get routing configuration', error);
    return [];
  }

  const valid = data.filter((d) => {
    const { error: validationError, success } = $RoutingConfig.safeParse(d);

    if (!success) {
      logger.error('Listed invalid routing configuration', validationError);
    }

    return success;
  });

  return sortAscByUpdatedAt(valid);
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

export async function getRoutingConfig(
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

export async function updateRoutingConfig(
  routingConfigId: string,
  updatedRoutingConfig: RoutingConfig
): Promise<RoutingConfig | undefined> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const { data, error } = await routingConfigurationApiClient.update(
    accessToken,
    routingConfigId,
    updatedRoutingConfig
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
