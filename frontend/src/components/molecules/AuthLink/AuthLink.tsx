'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import styles from './AuthLink.module.scss';

export const AuthLink = () => {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  let id = 'login-link';
  let linkContent = content.components.headerComponent.links.logIn;

  if (authStatus === 'authenticated') {
    id = 'logout-link';
    linkContent = content.components.headerComponent.links.logOut;
  }

  return (
    <div className={styles.account__login} data-testid='login-link'>
      <a id={id} className={styles.account__login_link} href={linkContent.href}>
        {linkContent.text}
      </a>
    </div>
  );
};
