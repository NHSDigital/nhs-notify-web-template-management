'use client';

import React, { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import JsCookie from 'js-cookie';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export default function Page() {
  const { signOut, authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      signOut({ global: true });
      JsCookie.remove('csrf_token');
    }
  }, [authStatus, signOut]);

  return (
    <NHSNotifyMain>
      <p>{authStatus === 'authenticated' ? 'Signing Out' : 'Signed Out'}</p>
    </NHSNotifyMain>
  );
}
