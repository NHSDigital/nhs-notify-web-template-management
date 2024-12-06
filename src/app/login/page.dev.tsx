'use client';

import React, { Suspense } from 'react';
import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Redirect } from '@molecules/Redirect/Redirect';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(require('../../../amplify_outputs.json'), { ssr: true });

const AuthenticatorWrapper = () => {
  return withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
  })({});
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthenticatorWrapper />
    </Suspense>
  );
}
