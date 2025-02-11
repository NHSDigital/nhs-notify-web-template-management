'use client';

import React, { Suspense, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Redirect } from '../page.dev';

export default function Page() {
  const { authStatus, signOut } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut();
    }
  }, [authStatus, signOut]);

  return (
    <NHSNotifyMain>
      <Suspense fallback={<p>Loading...</p>}>
        {authStatus === 'authenticated' ? <p>Signing out</p> : <Redirect />}
      </Suspense>
    </NHSNotifyMain>
  );
}
