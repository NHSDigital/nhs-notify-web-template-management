'use client';

import { createContext, PropsWithChildren, useContext } from 'react';
import { initialFeatureFlags } from '@utils/features';
import { ClientConfiguration } from 'nhs-notify-backend-client';

const ClientConfigContext = createContext<ClientConfiguration>({
  features: initialFeatureFlags,
});

export const useClientConfig = () => useContext(ClientConfigContext);

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
