'use client';

import { createContext, PropsWithChildren, useContext } from 'react';
import { initialFeatureFlags } from '@utils/features';
import { ClientConfiguration } from 'nhs-notify-backend-client';

const ClientConfigContext = createContext<ClientConfiguration>({
  features: initialFeatureFlags,
});

export const useClientConfig = () => useContext(ClientConfigContext);

/** returns a list of campaign ids for the current client */
export function useCampaignIds(): string[] {
  const { campaignIds = [], campaignId = '' } = useClientConfig();

  const ids = new Set(campaignIds);

  if (campaignId) {
    ids.add(campaignId);
  }

  return [...ids].sort();
}

export function ClientConfigProvider({
  children,
  config,
}: PropsWithChildren<{ config: ClientConfiguration }>) {
  return (
    <ClientConfigContext.Provider value={config}>
      {children}
    </ClientConfigContext.Provider>
  );
}
