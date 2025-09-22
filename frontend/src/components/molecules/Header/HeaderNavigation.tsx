'use client';

import { useEffect, useRef, useState } from 'react';
import type { AuthStatus } from '@aws-amplify/ui';
import Link from 'next/link';
import content from '@content/content';
import { useAuthStatus } from '@hooks/use-auth-status';
import { fetchAuthSession } from 'aws-amplify/auth';
import { clientConfigurationApiClient } from 'nhs-notify-backend-client';

const headerContent = content.components.header;

export function HeaderNavigation({
  initialAuthStatus,
  routingEnabled: initialRoutingEnabled = false,
}: {
  initialAuthStatus: AuthStatus;
  routingEnabled?: boolean;
}) {
  const authStatus = useAuthStatus(initialAuthStatus);
  const prevStatus = useRef(initialAuthStatus);
  const [routingEnabled, setRoutingEnabled] = useState(initialRoutingEnabled);

  useEffect(() => {
    if (authStatus === prevStatus.current) return;

    prevStatus.current = authStatus;

    if (authStatus !== 'authenticated') {
      setRoutingEnabled(false);
      return;
    }

    (async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (!token) return;

        const result = await clientConfigurationApiClient.fetch(token);
        setRoutingEnabled(result.data?.features?.routing ?? false);
      } catch {
        setRoutingEnabled(false);
      }
    })();
  }, [authStatus]);

  return (
    <>
      {authStatus === 'authenticated' && (
        <nav
          className='nhsuk-header__navigation'
          aria-label={headerContent.navigationMenu.ariaLabel}
          data-testid='navigation-links'
        >
          <div className='nhsuk-header__navigation-container nhsuk-width-container'>
            <ul className='nhsuk-header__navigation-list'>
              {headerContent.navigationMenu.links
                .filter(
                  ({ feature }) => feature !== 'routing' || routingEnabled
                )
                .map(({ text, href }, index) => {
                  return (
                    <li
                      className='nhsuk-header__navigation-item'
                      key={`item-${index}`}
                    >
                      <Link
                        className='nhsuk-header__navigation-link'
                        href={href}
                      >
                        {text}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
