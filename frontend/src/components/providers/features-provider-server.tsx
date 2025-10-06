'use server';

import { PropsWithChildren } from 'react';
import { getSessionServer } from '@utils/amplify-utils';
import { initialFeatureFlags } from '@utils/features';
import { fetchClient } from '@utils/server-features';
import { FeatureFlagProvider } from '@providers/features-provider';

export default async function FeatureFlagProviderServer({
  children,
}: PropsWithChildren) {
  const session = await getSessionServer();

  let featureFlags = initialFeatureFlags;

  if (session.accessToken) {
    try {
      const client = await fetchClient(session.accessToken);

      if (client.data) {
        featureFlags = { ...initialFeatureFlags, ...client.data.features };
      }
    } catch {
      // no-op
    }
  }
  return (
    <FeatureFlagProvider featureFlags={featureFlags}>
      {children}
    </FeatureFlagProvider>
  );
}
