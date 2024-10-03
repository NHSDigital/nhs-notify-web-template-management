/* eslint-disable no-restricted-globals,@typescript-eslint/no-require-imports,unicorn/prefer-module,no-console */

'use client';

import { Amplify } from 'aws-amplify';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signOut } from '@aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(require('@/amplify_outputs.json'), { ssr: true });

const Redirect = () => {
  const searchParams = useSearchParams();

  const redirect = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    location.href = redirect;
  }, [redirect]);

  if (redirect) {
    return (
      <h3>
        Redirecting to{' '}
        <code>
          <a href={redirect}>{redirect}</a>
        </code>
      </h3>
    );
  }
};

const MockAuthPage = () => {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut()
        .then(() => setSignedOut(true))
        .catch((error) => console.error(error));
    }
  });

  if (signedOut) {
    return (
      <Suspense>
        <Redirect />
      </Suspense>
    );
  }
  return <p>Signing out</p>;
};

const WrappedAuthPage = () => (
  <Authenticator.Provider>
    <MockAuthPage />
  </Authenticator.Provider>
);

export default WrappedAuthPage;
