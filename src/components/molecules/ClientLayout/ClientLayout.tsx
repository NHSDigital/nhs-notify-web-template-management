'use client';

import '@styles/app.scss';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
import { NHSNotifyAuthenticator } from '@molecules/NHSNotifyAuthenticator/NHSNotifyAuthenticator';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NHSNotifyAuthenticator>
      <NHSNotifySkipLink />
      <NHSNotifyHeader />
      <NHSNotifyContainer>{children}</NHSNotifyContainer>
      <NHSNotifyFooter />
    </NHSNotifyAuthenticator>
  );
};
