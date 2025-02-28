'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
// eslint-disable-next-line import/no-unresolved
import amplifyConfig from '@/amplify_outputs.json';

Amplify.configure(amplifyConfig, { ssr: true });

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <NHSNotifySkipLink />
      <NHSNotifyHeader />
      <NHSNotifyContainer>{children}</NHSNotifyContainer>
      <NHSNotifyFooter />
    </Authenticator.Provider>
  );
}
