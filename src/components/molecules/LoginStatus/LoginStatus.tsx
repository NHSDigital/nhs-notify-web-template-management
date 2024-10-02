/* eslint-disable no-console,unicorn/no-document-cookie */

'use client';

import { Header } from 'nhsuk-react-components';
import React, { useEffect, useState } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import cookie from 'cookie';
import { getAuthBasePath } from '@utils/get-base-path';

const getLoggedInUser = (cookieString: string) => {
  console.log('cookies', cookieString);

  const cookies = cookie.parse(cookieString);

  if (!cookies) {
    return;
  }
  console.log('cookies', cookies);

  const idTokenCookieName = Object.keys(cookies).find(
    (cookieName) =>
      cookieName.includes('CognitoIdentityServiceProvider') &&
      cookieName.includes('idToken')
  );

  if (!idTokenCookieName) {
    return;
  }
  console.log('idTokenCookieName', idTokenCookieName);

  const idTokenCookieValue = cookies[idTokenCookieName];

  if (!idTokenCookieValue) {
    return;
  }
  console.log('idTokenCookieValue', idTokenCookieValue);

  const idTokenCookieDecoded = jwtDecode<JwtPayload & { email: string }>(
    idTokenCookieValue
  );

  if (!idTokenCookieDecoded) {
    return;
  }
  console.log('idTokenCookieDecoded', idTokenCookieDecoded);

  return idTokenCookieDecoded.email;
};

export default function LoginStatus() {
  const [browserCookie, setBrowserCookie] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('/');

  useEffect(() => {
    const newBrowserCookie = document.cookie;
    setBrowserCookie(newBrowserCookie);
    setRedirectUrl(location.pathname); // eslint-disable-line no-restricted-globals
  }, []);

  const loggedInUser = getLoggedInUser(browserCookie);

  if (loggedInUser) {
    return (
      <>
        <Header.ServiceName key='serviceName'>
          {loggedInUser}
        </Header.ServiceName>
        <Header.NavItem
          href={`${getAuthBasePath()}/signout?redirect=${encodeURIComponent(redirectUrl)}`}
        >
          Sign out
        </Header.NavItem>
      </>
    );
  }

  return (
    <Header.NavItem
      href={`${getAuthBasePath()}?redirect=${encodeURIComponent(redirectUrl)}`}
    >
      Sign in
    </Header.NavItem>
  );
}
