import content from '@content/content';
import { AuthLink } from '@molecules/AuthLink/AuthLink';
import { truncate } from '@utils/truncate';
import Link from 'next/link';
import React from 'react';

interface NhsNotifyHeaderWithAccountProps {
  userName?: string;
  _accountUrl?: string;
  _signOutUrl?: string;
  dataTestId?: string;
}

const NhsNotifyHeaderWithAccount: React.FC<NhsNotifyHeaderWithAccountProps> = ({
  userName,
  _accountUrl,
  _signOutUrl,
  dataTestId,
}) => (
  <header
    className='nhsuk-header'
    role='banner'
    data-module='nhsuk-header'
    data-testid={dataTestId ?? 'page-header'}
  >
    <div className='nhsuk-header__container nhsuk-width-container'>
      <div className='nhsuk-header__service'>
        <Link
          className='nhsuk-header__service-logo'
          href='/message-templates'
          aria-label={content.components.header.links.logoLink.ariaLabel}
        >
          <svg
            className='nhsuk-header__logo'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 200 80'
            height='40'
            width='100'
            focusable='false'
            role='img'
            aria-label='NHS'
          >
            <title>{content.components.header.links.logoLink.logoTitle}</title>
            <path
              fill='currentcolor'
              d='M200 0v80H0V0h200Zm-27.5 5.5c-14.5 0-29 5-29 22 0 10.2 7.7 13.5 14.7 16.3l.7.3c5.4 2 10.1 3.9 10.1 8.4 0 6.5-8.5 7.5-14 7.5s-12.5-1.5-16-3.5L135 70c5.5 2 13.5 3.5 20 3.5 15.5 0 32-4.5 32-22.5 0-19.5-25.5-16.5-25.5-25.5 0-5.5 5.5-6.5 12.5-6.5a35 35 0 0 1 14.5 3l4-13.5c-4.5-2-12-3-20-3Zm-131 2h-22l-14 65H22l9-45h.5l13.5 45h21.5l14-65H64l-9 45h-.5l-13-45Zm63 0h-18l-13 65h17l6-28H117l-5.5 28H129l13.5-65H125L119.5 32h-20l5-24.5Z'
            />
          </svg>
          <span className='nhsuk-header__service-name'>
            {content.components.header.serviceName}
          </span>
        </Link>
      </div>
      <nav className='nhsuk-header__account' aria-label='Account'>
        <ul className='nhsuk-header__account-list'>
          <li className='nhsuk-header__account-item'>
            <svg
              className='nhsuk-icon nhsuk-icon__user'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              aria-hidden='true'
              focusable='false'
            >
              <path d='M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 2a9 9 0 0 0-5 16.5V18a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.5A9 9 0 0 0 12 3Zm0 3a3.5 3.5 0 1 1-3.5 3.5A3.4 3.4 0 0 1 12 6Z'></path>
            </svg>
            {truncate('Florence Nightingale (Regional Manager)')}
          </li>
          <li className='nhsuk-header__account-item'>
            {truncate('Client name')}
          </li>
          <li className='nhsuk-header__account-item'>
            <AuthLink className='nhsuk-header__account-link' />
          </li>
        </ul>
      </nav>
    </div>
    <nav className='nhsuk-header__navigation' aria-label='Menu'>
      <div className='nhsuk-header__navigation-container nhsuk-width-container'>
        <ul className='nhsuk-header__navigation-list'>
          {content.components.header.nav.map(({ text, href }, index) => {
            return (
              <li className='nhsuk-header__navigation-item'>
                <Link className='nhsuk-header__navigation-link' href={href}>
                  {text}
                </Link>
              </li>
            );
          })}
          <li className='nhsuk-header__menu' hidden>
            <button
              className='nhsuk-header__menu-toggle nhsuk-header__navigation-link'
              id='toggle-menu'
              aria-expanded='false'
            >
              <span className='nhsuk-u-visually-hidden'>Browse </span>More
              <svg
                className='nhsuk-icon nhsuk-icon__chevron-down'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                aria-hidden='true'
                focusable='false'
              >
                <path d='M15.5 12a1 1 0 0 1-.29.71l-5 5a1 1 0 0 1-1.42-1.42l4.3-4.29-4.3-4.29a1 1 0 0 1 1.42-1.42l5 5a1 1 0 0 1 .29.71z'></path>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </header>
);

export default NhsNotifyHeaderWithAccount;
