'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';
// eslint-disable-next-line import/no-unresolved
import amplifyConfig from '@/amplify_outputs.json';

Amplify.configure(amplifyConfig, { ssr: true });

const config = {
  logoutInSeconds:
    Number(process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS) || 900, // 15 minutes force logout
  promptTimeSeconds:
    Number(process.env.NEXT_PUBLIC_PROMPT_SECONDS_BEFORE_LOGOUT) || 120, // 2 minutes before logout
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <NHSNotifySkipLink />
      <NHSNotifyHeader />
      <NHSNotifyContainer>{children}</NHSNotifyContainer>
      <NHSNotifyFooter />
      <LogoutWarningModal
        logoutInSeconds={config.logoutInSeconds}
        promptBeforeLogoutSeconds={config.promptTimeSeconds}
      />
    </Authenticator.Provider>
  );
}
