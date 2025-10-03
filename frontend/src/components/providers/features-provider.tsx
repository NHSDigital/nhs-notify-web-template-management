'use client';

import { createContext, PropsWithChildren, useContext } from 'react';
import { initialFeatureFlags } from '@utils/features';
import { ClientFeatures } from 'nhs-notify-backend-client';

const FeatureFlagContext = createContext<ClientFeatures>(initialFeatureFlags);

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export function FeatureFlagProvider({
  children,
  featureFlags,
}: PropsWithChildren<{ featureFlags: ClientFeatures }>) {
  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
