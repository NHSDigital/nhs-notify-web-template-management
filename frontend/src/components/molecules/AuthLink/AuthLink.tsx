'use client';

import React from 'react';
import type { AuthStatus } from '@aws-amplify/ui';
import content from '@content/content';
import styles from './AuthLink.module.scss';
import classNames from 'classnames';
import { useAuthStatus } from '@hooks/use-auth-status';

export const AuthLink = ({
  className,
  initialAuthStatus,
}: {
  className?: string;
  initialAuthStatus?: AuthStatus;
}) => {
  const authStatus = useAuthStatus(initialAuthStatus);

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
      data-testid={id}
      href={linkContent.href}
    >
      {linkContent.text}
    </a>
  );
};
