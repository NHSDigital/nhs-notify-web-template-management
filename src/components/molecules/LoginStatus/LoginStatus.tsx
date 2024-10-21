'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { getBasePath } from '@utils/get-base-path';
import { usePathname } from 'next/navigation';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

export const LoginStatus = () => {
  const pathname = usePathname() ?? '/';
  const { authStatus } = useAuthenticator();
  const [loggedInUser, setLoggedInUser] = useState<string>();

  useEffect(() => {
    fetchAuthSession().then((session) => {
      setLoggedInUser(session.tokens?.idToken?.payload?.email?.toString());
    });
  }, [authStatus]);

  if (authStatus === 'authenticated') {
    return (
      <>
        {loggedInUser && (
          <Header.ServiceName key='serviceName'>
            {loggedInUser}
          </Header.ServiceName>
        )}
        <Header.NavItem
          href={`${getBasePath()}/auth/signout?redirect=${encodeURIComponent(pathname)}`}
        >
          Sign out
        </Header.NavItem>
      </>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <Header.NavItem
        href={`${getBasePath()}/auth?redirect=${encodeURIComponent(pathname)}`}
      >
        Sign in
      </Header.NavItem>
    );
  }
};
