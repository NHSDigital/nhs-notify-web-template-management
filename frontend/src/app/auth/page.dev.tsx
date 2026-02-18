'use client';

import React, { Suspense } from 'react';
import { useSearchParams, redirect, RedirectType } from 'next/navigation';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// this is an npm module, not node:path
// eslint-disable-next-line  unicorn/prefer-node-protocol
import path from 'path';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyContainer } from '@layouts/container/container';

const useRedirectPath = () => {
  const searchParams = useSearchParams();

  const requestRedirectPath = searchParams.get('redirect');

  if (!requestRedirectPath) {
    return redirect('/', RedirectType.push);
  }

  return path.normalize(requestRedirectPath);
};

const SignIn = () => {
  const redirectPath = useRedirectPath();

  redirect(`/auth/signin?redirect=${encodeURIComponent(redirectPath)}`);
};

export default function Page() {
  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <Suspense fallback={<p>Loading...</p>}>
          <Authenticator
            variation='default'
            hideSignUp
            formFields={{
              signIn: {
                username: {
                  type: 'text',
                },
              },
            }}
          >
            <SignIn />
          </Authenticator>
        </Suspense>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
