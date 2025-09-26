'use client';

import { useAuthStatus } from '@hooks/use-auth-status';
import type { AuthStatus } from '@aws-amplify/ui';
import content from '@content/content';
import Link from 'next/link';
import { useFeatureFlags } from '@providers/features-provider';
import { ClientFeatures } from 'nhs-notify-backend-client';

const headerContent = content.components.header;

export function HeaderNavigation({
  initialAuthStatus,
}: {
  initialAuthStatus: AuthStatus;
}) {
  const authStatus = useAuthStatus(initialAuthStatus);
  const { featureFlags, loaded: featureFlagsLoaded } = useFeatureFlags();

  if (authStatus !== 'authenticated' || !featureFlagsLoaded) return null;

  return (
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
                featureFlags[feature as keyof ClientFeatures] === true
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
  );
}
