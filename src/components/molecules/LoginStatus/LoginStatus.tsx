/* eslint-disable no-console,unicorn/no-document-cookie */

'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import cookie from 'cookie';
import { getAuthBasePath, getBasePath } from '@utils/get-base-path';
import { usePathname } from 'next/navigation';

const decodeCookie = (cookieValue: string) => {
  try {
    return jwtDecode<JwtPayload & { email: string }>(cookieValue);
  } catch (error) {
    console.error(error);
  }
};

const getLoggedInUser = (cookieString: string) => {
  const cookies = cookie.parse(cookieString);
  const idTokenCookieName = Object.keys(cookies).find(
    (cookieName) =>
      cookieName.includes('CognitoIdentityServiceProvider') &&
      cookieName.includes('idToken')
  );

  if (!idTokenCookieName) {
    return;
  }

  const idTokenCookieValue = cookies[idTokenCookieName];
  const idTokenCookieDecoded = decodeCookie(idTokenCookieValue);

  if (!idTokenCookieDecoded) {
    return;
  }

  return idTokenCookieDecoded.email;
};

export const LoginStatus = () => {
  const [browserCookie, setBrowserCookie] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    const newBrowserCookie = document.cookie;
    setBrowserCookie(newBrowserCookie);
  }, []);

  const loggedInUser = getLoggedInUser(browserCookie);

  if (loggedInUser) {
    return (
      <>
        <Header.ServiceName key='serviceName'>
          {loggedInUser}
        </Header.ServiceName>
        <Header.NavItem
          href={`${getAuthBasePath()}/signout?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
        >
          Sign out
        </Header.NavItem>
      </>
    );
  }

  return (
    <Header.NavItem
      href={`${getAuthBasePath()}?redirect=${encodeURIComponent(getBasePath())}${encodeURIComponent(pathname)}`}
    >
      Sign in
    </Header.NavItem>
  );
};
