/* eslint-disable no-console,unicorn/no-document-cookie */

'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { getAuthBasePath, getBasePath } from '@utils/get-base-path';
import { usePathname } from 'next/navigation';
import { fetchAuthSession, JWT } from '@aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

export const LoginStatus = () => {
  const pathname = usePathname();
  const { authStatus } = useAuthenticator();
  const [idToken, setIdToken] = useState<JWT['payload'] | undefined>();

  useEffect(() => {
    fetchAuthSession().then((session) => {
      console.log(session);
      setIdToken(session.tokens?.idToken?.payload);
    });
  }, [authStatus]);

  if (authStatus === 'authenticated') {
    return (
      <>
        <Header.ServiceName key='serviceName'>
          {idToken?.email?.toString() || ''}
        </Header.ServiceName>
        <Header.NavItem
          href={`${getAuthBasePath()}/signout?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
        >
          Sign out
        </Header.NavItem>
      </>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <Header.NavItem
        href={`${getAuthBasePath()}?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
      >
        Sign in
      </Header.NavItem>
    );
  }
};
