'use server';

import {
  RoutingConfig,
  routingConfigurationApiClient,
} from 'nhs-notify-backend-client';
import { getSessionServer } from './amplify-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

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

  return data;
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

  return data;
}
