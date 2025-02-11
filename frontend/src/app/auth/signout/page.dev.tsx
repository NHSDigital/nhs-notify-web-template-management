'use client';

import React, { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Redirect } from '../page.dev';

export const SignOut = ({ children }: { children: React.ReactNode }) => {
  const { signOut, authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut();
    }
  }, [authStatus, signOut]);

  return (
    <NHSNotifyMain>
      <Suspense fallback={<p>Loading...</p>}>
        {authStatus === 'authenticated' ? <p>Signing out</p> : children}
      </Suspense>
    </NHSNotifyMain>
  );
};

export default function Page() {
  return (
    <SignOut>
      <Redirect />
    </SignOut>
  );
}
