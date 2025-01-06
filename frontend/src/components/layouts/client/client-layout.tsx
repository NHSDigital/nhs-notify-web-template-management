'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
import { AMPLIFY_OUTPUTS } from '@utils/amplify-outputs';

Amplify.configure(AMPLIFY_OUTPUTS(), { ssr: true });

export function ClientLayout({ children }: { children: React.ReactNode }) {
  console.log('amplify ouputs', AMPLIFY_OUTPUTS());
  console.log('amplify config', process.env);
  return (
    <Authenticator.Provider>
      <NHSNotifySkipLink />
      <NHSNotifyHeader />
      <NHSNotifyContainer>{children}</NHSNotifyContainer>
      <NHSNotifyFooter />
    </Authenticator.Provider>
  );
}
