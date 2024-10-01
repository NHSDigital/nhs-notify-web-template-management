/* eslint-disable no-console */

'use client';

import { Header } from 'nhsuk-react-components';
import React from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const getLoggedInUser = (cookies: ReadonlyRequestCookies) => {
  const allCookies = cookies.getAll();
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

const signOut = (cookies: ReadonlyRequestCookies) => {
  const allCookies = cookies.getAll();
  const authCookies = allCookies.filter((cookie) =>
    cookie.name.includes('CognitoIdentityServiceProvider')
  );

  for (const cookie of authCookies) cookies.delete(cookie.name);
};

export default function LoginStatus({
  cookies,
}: {
  cookies: ReadonlyRequestCookies;
}) {
  const loggedInUser = getLoggedInUser(cookies);

  if (loggedInUser) {
    return (
      <>
        <Header.ServiceName key='serviceName'>loggedInUser</Header.ServiceName>,
        <Header.NavItem key='navItem' onClick={() => signOut(cookies)}>
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
