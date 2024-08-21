'use client';

import content from '@content/content';
import Link from 'next/link';

const { invalidSessionPageContent } = content.pages;

export default function InvalidSessionPage() {
  return (
    <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
      <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
        {invalidSessionPageContent.pageHeading}
      </h1>

      <p>
        {invalidSessionPageContent.p1}
        <Link href={invalidSessionPageContent.backLink.path}>
          {invalidSessionPageContent.backLink.text}
        </Link>
      </p>
      <p>{invalidSessionPageContent.p2}</p>

      <h2 className='nhsuk-heading-m'>
        {invalidSessionPageContent.contact1.header}
      </h2>
      <p>
        <Link href={invalidSessionPageContent.contact1.href}>
          {invalidSessionPageContent.contact1.contactDetail}
        </Link>
      </p>
    </div>
  );
}
