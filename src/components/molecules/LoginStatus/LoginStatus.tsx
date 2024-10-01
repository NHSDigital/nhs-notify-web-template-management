/* eslint-disable no-console */

'use client';

import { Header } from 'nhsuk-react-components';
import React from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { cookies as getCookies } from 'next/headers';

const getLoggedInUser = () => {
  const allCookies = getCookies().getAll();
  const idTokenCookie = allCookies.find(
    (cookie) =>
      cookie.name.includes('CognitoIdentityServiceProvider') &&
      cookie.name.includes('idToken')
  );
  const idTokenCookieValue = idTokenCookie?.value;

  if (!idTokenCookieValue) {
    return;
  }

  const idTokenCookieDecoded = jwtDecode<JwtPayload & { email: string }>(
    idTokenCookieValue
  );

  return idTokenCookieDecoded.email;
};

const signOut = () => {
  const cookies = getCookies();
  const allCookies = cookies.getAll();
  const authCookies = allCookies.filter((cookie) =>
    cookie.name.includes('CognitoIdentityServiceProvider')
  );

  for (const cookie of authCookies) cookies.delete(cookie.name);
};

export default function LoginStatus() {
  const loggedInUser = getLoggedInUser();

  if (loggedInUser) {
    return (
      <>
        <Header.ServiceName key='serviceName'>loggedInUser</Header.ServiceName>,
        <Header.NavItem key='navItem' onClick={() => signOut()}>
          Sign out
        </Header.NavItem>
        ,
      </>
    );
  }

  return (
    <Header.NavItem
      href={`/auth~featuredomain-testing?redirect=${encodeURIComponent(location.pathname)}`} // eslint-disable-line no-restricted-globals
    >
      Sign in
    </Header.NavItem>
  );
}
