'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStatus } from '@hooks/use-auth-status';
import { initialFeatureFlags } from '@utils/features';
import { ClientFeatures } from 'nhs-notify-backend-client';

const FeatureFlagContext = createContext<{
  featureFlags: ClientFeatures;
  loaded: boolean;
}>({
  featureFlags: initialFeatureFlags,
  loaded: false,
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export function FeatureFlagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [featureFlags, setFeatureFlags] =
    useState<ClientFeatures>(initialFeatureFlags);

  const [loaded, setLoaded] = useState<boolean>(false);

  const authStatus = useAuthStatus();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setFeatureFlags(initialFeatureFlags);
      return;
    }
    if (authStatus !== 'authenticated') {
      return;
    }

    const fetchFeatureFlags = async () => {
      try {
        const response = await fetch('/templates/internal/features', {
          headers: {
            'x-internal-request': 'true',
          },
        });

        if (!response.ok) {
          setFeatureFlags(initialFeatureFlags);
        }

        const data: ClientFeatures = await response.json();
        setFeatureFlags(data);
      } catch {
        setFeatureFlags(initialFeatureFlags);
      } finally {
        setLoaded(true);
      }
    };

    fetchFeatureFlags();
  }, [authStatus]);

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, loaded }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
