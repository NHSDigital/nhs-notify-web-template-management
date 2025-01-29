'use client';

import React from 'react';
import { signOut } from 'aws-amplify/auth';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';
// this is an npm module, not node:path
// eslint-disable-next-line  unicorn/prefer-node-protocol
import path from 'path';
import { getBasePath } from '@utils/get-base-path';
import { formatTime } from '@molecules/LogoutWarningModal/format-time';

const timeTillLogout =
  Number(process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS) || 900;

export default function Inactive() {
  const searchParams = useSearchParams();

  const basePath = getBasePath();

  const requestRedirectPath =
    searchParams.get('redirect') || `${basePath}/create-and-submit-templates`;

  const redirectPath = path.normalize(requestRedirectPath);

  signOut({ global: true });

  return (
    <div className='nhsuk-grid-row'>
      <h1>You&apos;ve been signed out</h1>
      <p>
        You&apos;ve been signed out because you&apos;ve not used this service
        for {formatTime(timeTillLogout)}.
      </p>
      <p>Any unsaved changes have been lost.</p>
      <p>Sign in again to create and submit a template to NHS Notify.</p>
      <Button href={`/auth?redirect=${redirectPath}`}>Sign in</Button>
    </div>
  );
}
