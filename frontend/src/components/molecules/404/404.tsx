'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import classNames from 'classnames';
import Link from 'next/link';

const { error404 } = content.pages;

export const ErrorPage404 = () => {
  return (
    <NHSNotifyMain>
      <div
        className={classNames(
          'nhsuk-grid-row',
          'nhsuk-u-padding-left-3',
          'nhsuk-u-padding-right-3'
        )}
        data-testid='page-content-wrapper'
      >
        <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
          {error404.pageHeading}
        </h1>

        <p>
          {error404.p1}
          <Link href={error404.backLink.path}>{error404.backLink.text}</Link>
        </p>
        <p>{error404.p2}</p>

        <h2 className='nhsuk-heading-m'>{error404.contact1.header}</h2>
        <p>
          <Link href={error404.contact1.href}>
            {error404.contact1.contactDetail}
          </Link>
        </p>
      </div>
    </NHSNotifyMain>
  );
};
