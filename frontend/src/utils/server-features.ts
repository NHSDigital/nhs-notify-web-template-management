'use server';

import { cache } from 'react';
import {
  clientConfigurationApiClient,
  ClientFeatures,
} from 'nhs-notify-backend-client';
import { getSessionServer } from './amplify-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

/*
 * Caches at the request context level. Not a global cache.
 */
const fetchClient = cache(async (accessToken: string) =>
  clientConfigurationApiClient.fetch(accessToken)
);

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
  const { accessToken } = await getSessionServer();

  if (!accessToken) return false;

  const clientConfiguration = await fetchClient(accessToken);

  if (clientConfiguration.error) {
    logger.error(
      'Failed to fetch client configuration',
      clientConfiguration.error
    );
  }

  return clientConfiguration.data?.features[feature] ?? false;
}
