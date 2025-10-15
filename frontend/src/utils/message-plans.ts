import {
  type RoutingConfig,
  $RoutingConfig,
  type RoutingConfigStatusActive,
} from 'nhs-notify-backend-client';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client/src/routing-config-api-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { getSessionServer } from './amplify-utils';
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
