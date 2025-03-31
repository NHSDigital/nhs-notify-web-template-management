'use client';

import React, { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';
import JsCookie from 'js-cookie';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export const SignOut = ({ children }: { children: React.ReactNode }) => {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut({ global: true });
      JsCookie.remove('csrf_token');
    }
  }, [authStatus]);

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
      <p>Signed Out</p>
    </SignOut>
  );
}
