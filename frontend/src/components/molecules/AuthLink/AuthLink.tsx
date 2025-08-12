'use client';

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import styles from './AuthLink.module.scss';
import classNames from 'classnames';

export const AuthLink = ({ className }: { className?: string }) => {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  let id = 'sign-in-link';
  let linkContent = content.components.header.accountInfo.links.signIn;

  if (authStatus === 'authenticated') {
    id = 'sign-out-link';
    linkContent = content.components.header.accountInfo.links.signOut;
  }

  return (
    <a
      id={id}
      className={classNames(styles['auth-link'], className)}
      data-testid='auth-link'
      href={linkContent.href}
    >
      {linkContent.text}
    </a>
  );
};
