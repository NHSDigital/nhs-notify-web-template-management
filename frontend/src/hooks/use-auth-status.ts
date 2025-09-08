'use client';

import { useEffect, useState } from 'react';
import type { AuthStatus } from '@aws-amplify/ui';
import { useAuthenticator } from '@aws-amplify/ui-react';

export function useAuthStatus(initialStatus: AuthStatus = 'configuring') {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const [status, setStatus] = useState<AuthStatus>(
    authStatus === 'configuring' ? initialStatus : authStatus
  );

  useEffect(() => {
    if (authStatus !== 'configuring') {
      setStatus(authStatus);
    }
  }, [authStatus]);

  return status;
}
