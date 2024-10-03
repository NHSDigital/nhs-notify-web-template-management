/* eslint-disable no-restricted-globals */

'use client';

import { Suspense, useEffect } from 'react';
import { deleteCookie } from 'cookies-next';
import { useSearchParams } from 'next/navigation';

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
  deleteCookie('CognitoIdentityServiceProvider.idToken');

  return (
    <Suspense>
      <Redirect />
    </Suspense>
  );
};

export default MockAuthPage;
