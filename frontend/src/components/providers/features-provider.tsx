'use client';

import { ClientFeatures } from 'nhs-notify-backend-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStatus } from '@hooks/use-auth-status';

export type FeatureFlags = ClientFeatures;

export const FEATURE_KEYS: (keyof ClientFeatures)[] = ['proofing', 'routing'];

export const initialFeatureFlags: FeatureFlags = Object.fromEntries(
  FEATURE_KEYS.map((key) => [key, false])
) as FeatureFlags;

const FeatureFlagContext = createContext<FeatureFlags>(initialFeatureFlags);

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export function FeatureFlagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<FeatureFlags>(initialFeatureFlags);
  const authStatus = useAuthStatus();

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setFlags(initialFeatureFlags);
      return;
    }

    const fetchFeatureFlags = async () => {
      try {
        const response = await fetch('/templates/internal/features', {
          headers: {
            'x-internal-request': 'true',
          },
        });
        if (!response.ok) setFlags(initialFeatureFlags);

        const data: FeatureFlags = await response.json();

        setFlags(data);
      } catch {
        setFlags(initialFeatureFlags);
      }
    };

    fetchFeatureFlags();
  }, [authStatus]);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
