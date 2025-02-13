'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import Link from 'next/link';

const { error404PageContent } = content.pages;

export const ErrorPage404 = () => {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <h1
          id='not-found'
          className='nhsuk-heading-xl'
          data-testid='page-heading'
        >
          {error404PageContent.pageHeading}
        </h1>

        <p>
          {error404PageContent.p1}
          <Link href={error404PageContent.backLink.path}>
            {error404PageContent.backLink.text}
          </Link>
        </p>
        <p>{error404PageContent.p2}</p>

        <h2 className='nhsuk-heading-m'>
          {error404PageContent.contact1.header}
        </h2>
        <p>
          <Link href={error404PageContent.contact1.href}>
            {error404PageContent.contact1.contactDetail}
          </Link>
        </p>
      </div>
    </NHSNotifyMain>
  );
};
