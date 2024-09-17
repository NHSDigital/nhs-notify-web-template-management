'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { JwtPayload } from 'aws-jwt-verify/jwt-model';

export default function LoginStatus() {

  const { authStatus } = useAuthenticator();
  const [idToken, setIdToken] = useState<JwtPayload | undefined>();
  useEffect(() => {
    (async () => {
      const session = await fetchAuthSession();
      setIdToken(session.tokens?.idToken?.payload);
    })().catch(console.error);
  }, [authStatus]);

  switch (authStatus) {
    case 'authenticated': {
      return [
        <Header.ServiceName key='serviceName'>
          {idToken?.email?.toString() || ''}
        </Header.ServiceName>,
        <Header.NavItem key='navItem' onClick={() => signOut()}>
          Sign out
        </Header.NavItem>,
      ];
    }
    case 'unauthenticated': {
      return (
        <Header.NavItem
          href={`https://chel5-auth-poc-rebased.d11o7gqmt8o0cx.amplifyapp.com/auth?redirect=${encodeURIComponent(location.href)}`} // eslint-disable-line no-restricted-globals
        >
          Sign in
        </Header.NavItem>
      );
    }
    default:
  }
}
