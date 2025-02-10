'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import styles from './AuthLink.module.scss';

export const AuthLink = () => {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  let id = 'sign-in-link';
  let linkContent = content.components.headerComponent.links.signIn;

  if (authStatus === 'authenticated') {
    id = 'sign-out-link';
    linkContent = content.components.headerComponent.links.signOut;
  }

  return (
    <div className={styles['auth-link']} data-testid='auth-link'>
      <a
        id={id}
        className={styles['auth-link__link']}
        data-testid='auth-link__link'
        href={linkContent.href}
      >
        {linkContent.text}
      </a>
    </div>
  );
};
