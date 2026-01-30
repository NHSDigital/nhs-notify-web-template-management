'use client';

import React, { Suspense } from 'react';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';
import { getBasePath } from '@utils/get-base-path';
import { formatTime } from '@molecules/LogoutWarningModal/format-time';
import { SignOut } from '../signout/page.dev';

const timeTillLogout =
  Number(process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS) || 900;

const SignInButton = () => {
  const searchParams = useSearchParams().toString();

  const signInLink =
    `${getBasePath()}/auth` + (searchParams ? `?${searchParams}` : '');

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Button href={signInLink}>Sign in</Button>
    </Suspense>
  );
};

export default function Idle() {
  return (
    <SignOut>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-full'>
          <h1>You&apos;ve been signed out</h1>
          <p>
            You&apos;ve been signed out because you&apos;ve not used this
            service for {formatTime(timeTillLogout)}.
          </p>
          <p>Any unsaved changes have been lost.</p>
          <p>Sign in again to create and submit a template to NHS Notify.</p>
          <SignInButton />
        </div>
      </div>
    </SignOut>
  );
}
