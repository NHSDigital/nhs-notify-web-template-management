'use client';

import type { AuthStatus } from '@aws-amplify/ui';
import Link from 'next/link';
import { useAuthStatus } from '@hooks/use-auth-status';
import content from '@content/content';
import type { ClientFeatures } from 'nhs-notify-web-template-management-types';
import { useFeatureFlags } from '@providers/client-config-provider';

const headerContent = content.components.header;

export function HeaderNavigation({
  initialAuthStatus,
}: {
  initialAuthStatus: AuthStatus;
}) {
  const authStatus = useAuthStatus(initialAuthStatus);

  const features = useFeatureFlags();

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
                  ({ feature }) =>
                    !feature ||
                    features[feature as keyof ClientFeatures] === true
                )
                .map(({ text, href }, index) => (
                  <li
                    className='nhsuk-header__navigation-item'
                    key={`item-${index}`}
                  >
                    <Link className='nhsuk-header__navigation-link' href={href}>
                      {text}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
