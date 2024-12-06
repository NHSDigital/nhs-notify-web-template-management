'use client';

import React, { Suspense } from 'react';
import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(require('../../../amplify_outputs.json'), { ssr: true });

const Redirect = () => {
  const searchParams = useSearchParams();

  const requestDirectPath = searchParams.get('redirect');

  if (!requestDirectPath) {
    return redirect('/', RedirectType.push);
  }

  const redirectPath = path.normalize(`/redirect/${requestDirectPath}`);

  return redirect(redirectPath, RedirectType.push);
};

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
