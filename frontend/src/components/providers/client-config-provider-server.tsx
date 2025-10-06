'use server';

import { PropsWithChildren } from 'react';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { getSessionServer } from '@utils/amplify-utils';
import { initialFeatureFlags } from '@utils/features';
import { fetchClient } from '@utils/server-features';
import { ClientConfigProvider } from '@providers/client-config-provider';

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
    } catch {
      // no-op
    }
  }
  return (
    <ClientConfigProvider config={config}>{children}</ClientConfigProvider>
  );
}
