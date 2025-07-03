'use server';

import { cache } from 'react';
import { ClientConfiguration, Features } from 'nhs-notify-backend-client';
import { getSessionServer } from './amplify-utils';

/*
 * Caches at the request context level. Not a global cache.
 */
const fetchClient = cache(async (accessToken: string) =>
  ClientConfiguration.fetch(accessToken)
);

/**
 * Server-Side
 *
 * Fetches client configuration to check whether a specific feature is enabled
 * @param {string} feature keyof Features
 * @returns {Promise<Boolean>} boolean
 */
export async function serverIsFeatureEnabled(
  feature: keyof Features
): Promise<boolean> {
  const { accessToken } = await getSessionServer();

  if (!accessToken) return false;

  const client = await fetchClient(accessToken);

  return client?.featureEnabled(feature) ?? true;
}
