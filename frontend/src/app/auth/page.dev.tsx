'use client';

import React, { Suspense } from 'react';
import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// this is an npm module, not node:path
// eslint-disable-next-line  unicorn/prefer-node-protocol
import path from 'path';
import { getBasePath } from '@utils/get-base-path';

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

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Authenticator variation='default' hideSignUp>
        <Redirect />
      </Authenticator>
    </Suspense>
  );
}
