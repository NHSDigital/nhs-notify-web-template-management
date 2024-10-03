/* eslint-disable sonarjs/insecure-jwt-token,unicorn/no-null,no-restricted-globals */

'use client';

import { Suspense, useEffect } from 'react';
import { setCookie } from 'cookies-next';
import { useSearchParams } from 'next/navigation';
import { sign } from 'jsonwebtoken';

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
  const jwt = sign({ email: 'localhost@nhs.net ' }, null, {
    algorithm: 'none',
  });

  setCookie('CognitoIdentityServiceProvider.idToken', jwt);

  return (
    <Suspense>
      <Redirect />
    </Suspense>
  );
};

export default MockAuthPage;
