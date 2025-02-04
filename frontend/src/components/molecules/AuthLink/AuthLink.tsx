'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';

export const AuthLink = () => {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  let id = 'sign-in-link';
  let linkContent = content.components.headerComponent.links.signIn;

  if (authStatus === 'authenticated') {
    id = 'sign-out-link';
    linkContent = content.components.headerComponent.links.signOut;
  }

  return (
    <div className='nhsuk-account__sign-in' data-testid='sign-in-link'>
      <a
        id={id}
        className='nhsuk-account__sign-in--link'
        href={linkContent.href}
      >
        {linkContent.text}
      </a>
    </div>
  );
};
