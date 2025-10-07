'use server';

import { PropsWithChildren } from 'react';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { getSessionServer } from '@utils/amplify-utils';
import { initialFeatureFlags } from '@utils/features';
import { fetchClient } from '@utils/server-features';
import { ClientConfigProvider } from '@providers/client-config-provider';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export async function ClientConfigProviderServer({
  children,
}: PropsWithChildren) {
  const session = await getSessionServer();

  let config: ClientConfiguration = {
    features: initialFeatureFlags,
  };

  if (session.accessToken) {
    try {
      const client = await fetchClient(session.accessToken);

      if (client.data) {
        config = {
          ...client.data,
          features: { ...initialFeatureFlags, ...client.data.features },
        };
      }
    } catch (error) {
      logger.error('Error fetching client configuration', { error });
    }
  }
  return (
    <ClientConfigProvider config={config}>{children}</ClientConfigProvider>
  );
}
