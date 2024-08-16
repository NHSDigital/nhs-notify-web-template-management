'use client';

import content from '@content/content';
import { BackLink } from 'nhsuk-react-components';

const { invalidSessionPageContent } = content.pages;

export default function InvalidSessionPage() {
  return (
    <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
      <div className='nhsuk-grid-column-two-thirds'>
        <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
          {invalidSessionPageContent.pageHeading}
        </h1>

        <p>{invalidSessionPageContent.description}</p>

        <BackLink
          href={invalidSessionPageContent.backLink.path}
          className='nhsuk-u-margin-bottom-7 nhsuk-u-margin-left-3'
        >
          {invalidSessionPageContent.backLink.text}
        </BackLink>
      </div>
    </div>
  );
}
