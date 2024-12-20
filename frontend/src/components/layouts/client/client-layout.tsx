'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';

Amplify.configure(
  {
    auth: {
      aws_region: 'eu-west-2',
      user_pool_id: process.env.COGNITO_USER_POOL_ID,
      user_pool_client_id: process.env.COGNITO_USER_POOL_CLIENT_ID,
    },
  },
  { ssr: true }
);

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
