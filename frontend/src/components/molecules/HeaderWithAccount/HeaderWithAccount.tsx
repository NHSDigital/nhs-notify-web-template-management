'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import content from '@content/content';
import { AuthLink } from '@molecules/AuthLink/AuthLink';
import { truncate } from '@utils/truncate';
import Link from 'next/link';
import React from 'react';
import { getIdTokenClaims } from '@utils/token-utils';
import { ClientFeatures } from 'nhs-notify-backend-client';

type HeaderState = { displayName?: string; clientName?: string };

interface NhsNotifyHeaderWithAccountProps {
  features?: ClientFeatures;
}

const headerContent = content.components.header;

const NhsNotifyHeaderWithAccount = ({
  features
}: NhsNotifyHeaderWithAccountProps) => {
  // TODO: CCM-11148 Use real routing feature flag
  const routingEnabled = features?.routing;

  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  const [state, setState] = useState<HeaderState>({});

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setState({});
      return;
    }

    (async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (!idToken) {
          setState({});
          return;
        } else setState(getIdTokenClaims(idToken));
      } catch {
        setState({});
      }
    })();
  }, [authStatus]);

  const { displayName, clientName } = state;

  return (
    <header
      className='nhsuk-header'
      role='banner'
      data-module='nhsuk-header'
      data-testid='page-header'
    >
      <div className='nhsuk-header__container nhsuk-width-container'>
        <div className='nhsuk-header__service'>
          <Link
            className='nhsuk-header__service-logo'
            data-testid='header-logo-service-link'
            href={headerContent.logoLink.href}
            aria-label={headerContent.logoLink.ariaLabel}
          >
            <svg
              className='nhsuk-header__logo'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 200 80'
              height='40'
              width='100'
              focusable='false'
              role='img'
            >
              <title>{headerContent.logoLink.logoTitle}</title>
              <path
                fill='currentcolor'
                d='M200 0v80H0V0h200Zm-27.5 5.5c-14.5 0-29 5-29 22 0 10.2 7.7 13.5 14.7 16.3l.7.3c5.4 2 10.1 3.9 10.1 8.4 0 6.5-8.5 7.5-14 7.5s-12.5-1.5-16-3.5L135 70c5.5 2 13.5 3.5 20 3.5 15.5 0 32-4.5 32-22.5 0-19.5-25.5-16.5-25.5-25.5 0-5.5 5.5-6.5 12.5-6.5a35 35 0 0 1 14.5 3l4-13.5c-4.5-2-12-3-20-3Zm-131 2h-22l-14 65H22l9-45h.5l13.5 45h21.5l14-65H64l-9 45h-.5l-13-45Zm63 0h-18l-13 65h17l6-28H117l-5.5 28H129l13.5-65H125L119.5 32h-20l5-24.5Z'
              />
            </svg>
            <span className='nhsuk-header__service-name'>
              {headerContent.serviceName}
            </span>
          </Link>
        </div>
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
                  className='nhsuk-icon nhsuk-icon__user'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  focusable='false'
                >
                  <path d='M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 2a9 9 0 0 0-5 16.5V18a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.5A9 9 0 0 0 12 3Zm0 3a3.5 3.5 0 1 1-3.5 3.5A3.4 3.4 0 0 1 12 6Z'></path>
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
              <AuthLink className='nhsuk-header__account-link' />
            </li>
          </ul>
        </nav>
      </div>
      <nav
        className='nhsuk-header__navigation'
        aria-label={headerContent.navigationMenu.ariaLabel}
        data-testid='navigation-links'
      >
        <div className='nhsuk-header__navigation-container nhsuk-width-container'>
          <ul className='nhsuk-header__navigation-list'>
            {headerContent.navigationMenu.links
              .filter(({ feature }) => feature !== 'routing' || routingEnabled)
              .map(({ text, href }, index) => {
                return (
                  <li
                    className='nhsuk-header__navigation-item'
                    key={`item-${index}`}
                  >
                    <Link className='nhsuk-header__navigation-link' href={href}>
                      {text}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default NhsNotifyHeaderWithAccount;
