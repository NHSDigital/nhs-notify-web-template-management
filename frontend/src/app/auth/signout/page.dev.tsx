'use client';

import React, { Suspense, use } from 'react';
import { Redirect } from '../page.dev';
import { signOut } from 'aws-amplify/auth';

const UsePromise = ({
  promise: promise,
  children,
}: {
  promise: Promise<void>;
  children: React.ReactNode;
}) => {
  use(promise);

  return <>{children}</>;
};

export const SignOut = ({ children }: { children: React.ReactNode }) => {
  const signoutPromise = signOut({ global: true });

  return (
    <Suspense fallback={<p>Signing out...</p>}>
      <UsePromise promise={signoutPromise}>{children}</UsePromise>
    </Suspense>
  );
};

export default function Page() {
  return (
    <SignOut>
      <Redirect />
    </SignOut>
  );
}
