/* eslint-disable sonarjs/insecure-jwt-token,unicorn/no-null,no-restricted-globals,@typescript-eslint/no-require-imports,unicorn/prefer-module */

'use client';

import { Amplify } from 'aws-amplify';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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

const WrappedRedirect = () => (
  <Suspense>
    <Redirect />
  </Suspense>
);

const MockAuthPage = () => {
  return withAuthenticator(WrappedRedirect, {
    variation: 'default',
    hideSignUp: true,
  })({});
};

const WrappedAuthPage = () => (
  <Authenticator.Provider>
    <MockAuthPage />
  </Authenticator.Provider>
);

export default WrappedAuthPage;
