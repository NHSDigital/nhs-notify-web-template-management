'use client';

import React from 'react';
import { signOut } from 'aws-amplify/auth';
import { Button } from 'nhsuk-react-components';
import content from '@content/content';

export default function Page() {
  const {
    links: { logIn },
  } = content.components.headerComponent;

  signOut({ global: true });

  return (
    <div className='nhsuk-grid-row'>
      <h1>You&apos;ve been signed out</h1>
      <p>
        You&apos;ve been signed out because you&apos;ve not used this service
        for 15 minutes.
      </p>
      <p>Your template was not saved.</p>
      <p>Sign in again to create and submit a template to NHS Notify.</p>
      <Button href={logIn.href}>Sign in</Button>
    </div>
  );
}
