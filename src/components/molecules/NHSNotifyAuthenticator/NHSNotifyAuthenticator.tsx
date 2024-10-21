import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { usePathname, redirect } from 'next/navigation';
import { ReactNode, FC } from 'react';

type NHSNotifyAutheticatorProps = {
  children: ReactNode;
};

const isPathnameExempt = (pathname: string) => {
  return (
    pathname.includes('auth') ||
    pathname.includes('test') ||
    pathname === '/create-and-submit-templates'
  );
};

const NHSNotifyAuthenticatorCheck: FC<NHSNotifyAutheticatorProps> = ({
  children,
}) => {
  const { authStatus } = useAuthenticator();
  const pathname = usePathname() ?? '/';

  if (authStatus === 'authenticated' || isPathnameExempt(pathname)) {
    return children;
  }

  if (authStatus === 'configuring') {
    return;
  }

  redirect(`/auth?redirect=${encodeURIComponent(pathname)}`);
};

export const NHSNotifyAuthenticator: FC<NHSNotifyAutheticatorProps> = ({
  children,
}) => (
  <Authenticator.Provider>
    <NHSNotifyAuthenticatorCheck>{children}</NHSNotifyAuthenticatorCheck>
  </Authenticator.Provider>
);
