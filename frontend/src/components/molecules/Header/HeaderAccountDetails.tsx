'use client';

import { useEffect, useRef, useState } from 'react';
import type { AuthStatus } from '@aws-amplify/ui';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getIdTokenClaims } from '@utils/token-utils';
import content from '@content/content';
import { truncate } from '@utils/truncate';
import { AuthLink } from '@molecules/AuthLink/AuthLink';
import { useAuthStatus } from '@hooks/use-auth-status';

type AccountDetails = { displayName?: string; clientName?: string };

const headerContent = content.components.header;

export function HeaderAccountDetails({
  initialAccountDetails,
  initialAuthStatus,
}: {
  initialAccountDetails: AccountDetails;
  initialAuthStatus: AuthStatus;
}) {
  const authStatus = useAuthStatus(initialAuthStatus);
  const prevStatus = useRef(initialAuthStatus);

  const [accountDetails, setAccountDetails] = useState<AccountDetails>(
    initialAccountDetails
  );

  useEffect(() => {
    if (authStatus === prevStatus.current) {
      return;
    }

    prevStatus.current = authStatus;

    if (authStatus === 'unauthenticated') {
      setAccountDetails({});
      return;
    }

    (async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (idToken) {
          setAccountDetails(getIdTokenClaims(idToken));
        } else {
          setAccountDetails({});
          return;
        }
      } catch {
        setAccountDetails({});
      }
    })();
  }, [authStatus]);

  const { displayName, clientName } = accountDetails;
  return (
    <nav
      className='nhsuk-header__account'
      aria-label={headerContent.accountInfo.ariaLabel}
    >
      <ul className='nhsuk-header__account-list'>
        {displayName && (
          <li
            className='nhsuk-header__account-item'
            data-testid='account-display-name'
          >
            <svg
              className='nhsuk-icon nhsuk-icon--user'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              width='32'
              height='32'
              aria-hidden='true'
              focusable='false'
            >
              <path d='M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 2a9 9 0 0 0-5 16.5V18a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.5A9 9 0 0 0 12 3Zm0 3a3.5 3.5 0 1 1-3.5 3.5A3.4 3.4 0 0 1 12 6Z' />
            </svg>
            {truncate(displayName)}
          </li>
        )}
        {clientName && (
          <li
            className='nhsuk-header__account-item'
            data-testid='account-client-name'
          >
            {truncate(clientName)}
          </li>
        )}
        <li className='nhsuk-header__account-item'>
          <AuthLink
            className='nhsuk-header__account-link'
            initialAuthStatus={initialAuthStatus}
          />
        </li>
      </ul>
    </nav>
  );
}
