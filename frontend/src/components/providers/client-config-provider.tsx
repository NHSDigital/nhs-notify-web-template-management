'use client';

import { createContext, PropsWithChildren, useContext } from 'react';
import { getCampaignIds, initialFeatureFlags } from '@utils/client-config';
import type { ClientConfiguration } from 'nhs-notify-web-template-management-types';

const ClientConfigContext = createContext<ClientConfiguration | null>(null);

export const useClientConfig = () => useContext(ClientConfigContext);

export const useFeatureFlags = () => {
  const client = useClientConfig();

  if (!client) return initialFeatureFlags;

  return client.features;
};

/** returns a list of campaign ids for the current client */
export function useCampaignIds(): string[] {
  const client = useClientConfig();

  return getCampaignIds(client);
}

export const ClientConfigProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: ClientConfiguration | null }>) => (
  <ClientConfigContext.Provider value={value}>
    {children}
  </ClientConfigContext.Provider>
);
