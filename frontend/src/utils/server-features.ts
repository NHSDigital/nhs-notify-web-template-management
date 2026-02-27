'use server';

import { cache } from 'react';
import type { ClientFeatures } from 'nhs-notify-web-template-management-types';
import { clientConfigurationApiClient } from 'nhs-notify-backend-client/src/client-configuration-api-client';
import { getSessionServer } from './amplify-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

/*
 * Caches at the request context level. Not a global cache.
 */
const fetchClientCache = cache(async (accessToken: string) =>
  clientConfigurationApiClient.fetch(accessToken)
);

export const fetchClient = async () => {
  const { accessToken, clientId } = await getSessionServer();

  if (!accessToken || !clientId) return null;

  const clientConfig = await fetchClientCache(accessToken);

  if (clientConfig.error) {
    logger.error('Failed to fetch client configuration', clientConfig.error);

    return null;
  }

  return clientConfig.data;
};

/**
 * Server-Side
 *
 * Fetches client configuration to check whether a specific feature is enabled
 * @param {string} feature keyof ClientFeatures
 * @returns {Promise<Boolean>} boolean
 */
export async function serverIsFeatureEnabled(
  feature: keyof ClientFeatures
): Promise<boolean> {
  const clientConfig = await fetchClient();

  return clientConfig?.features[feature] ?? false;
}
