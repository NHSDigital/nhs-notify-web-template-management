'use client';

import { Amplify } from 'aws-amplify';
import { Suspense, useState, useEffect } from 'react';
import { signOut } from '@aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import { Redirect } from '@molecules/Redirect/Redirect';
import { getAmplifyOutputs } from '@utils/get-amplify-outputs';

Amplify.configure(getAmplifyOutputs(), { ssr: true });

const MockSignoutPage = () => {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (!signedOut) {
      signOut().then(() => setSignedOut(true));
    }
  });

  return signedOut ? <Redirect /> : <p>Signing out</p>;
};

const WrappedSignoutPage = () => (
  <Authenticator.Provider>
    <Suspense>
      <MockSignoutPage />
    </Suspense>
  </Authenticator.Provider>
);

export default WrappedSignoutPage;
