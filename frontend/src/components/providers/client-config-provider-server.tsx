'use server';

import { PropsWithChildren } from 'react';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { initialFeatureFlags } from '@utils/client-config';
import { fetchClient } from '@utils/server-features';
import { ClientConfigProvider } from '@providers/client-config-provider';

export async function ClientConfigProviderServer({
  children,
}: PropsWithChildren) {
  let config: ClientConfiguration = {
    features: initialFeatureFlags,
  };
  const clientConfig = await fetchClient();

  if (clientConfig) {
    config = {
      ...clientConfig,
      features: { ...initialFeatureFlags, ...clientConfig.features },
    };
  }

  return <ClientConfigProvider value={config}>{children}</ClientConfigProvider>;
}
