'use client';

import React, { Suspense } from 'react';
import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// this is an npm module, not node:path
// eslint-disable-next-line  unicorn/prefer-node-protocol
import path from 'path';
import { getBasePath } from '@utils/get-base-path';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(require('../../../amplify_outputs.json'), { ssr: true });

export const Redirect = () => {
  const searchParams = useSearchParams();

  const requestRedirectPath = searchParams.get('redirect');

  const basePath = getBasePath();

  if (!requestRedirectPath) {
    return redirect('/', RedirectType.push);
  }

  let redirectPath = path.normalize(requestRedirectPath);

  if (redirectPath.startsWith(basePath)) {
    redirectPath = redirectPath.slice(basePath.length);
  }

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
