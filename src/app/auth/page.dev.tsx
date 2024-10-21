'use client';

import { Amplify } from 'aws-amplify';
import { Suspense } from 'react';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Redirect } from '@molecules/Redirect/Redirect';
import { getAmplifyOutputs } from '@utils/get-amplify-outputs';

Amplify.configure(getAmplifyOutputs(), { ssr: true });

const MockAuthPage = () =>
  withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
  })({});

const WrappedAuthPage = () => (
  <Authenticator.Provider>
    <Suspense>
      <MockAuthPage />
    </Suspense>
  </Authenticator.Provider>
);

export default WrappedAuthPage;
