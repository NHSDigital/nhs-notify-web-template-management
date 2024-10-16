'use client';

import { Amplify } from 'aws-amplify';
import { Suspense } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Redirect } from '@molecules/Redirect/Redirect';
import { getAmplifyOutputs } from '@utils/get-amplify-outputs';

Amplify.configure(getAmplifyOutputs(), { ssr: true });

const AuthPage = () =>
  withAuthenticator(Redirect, {
    variation: 'default',
    hideSignUp: true,
  })({});

const WrappedAuthPage = () => (
  <Suspense>
    <AuthPage />
  </Suspense>
);

export default WrappedAuthPage;
