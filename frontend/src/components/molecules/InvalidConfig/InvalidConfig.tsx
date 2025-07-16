'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { InsetText } from 'nhsuk-react-components';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import Link from 'next/link';

const { pageHeading, text, insetText, backLinkText } =
  content.pages.invalidConfiguration;

export default function InvalidConfig() {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>
          <p>{text}</p>
          <InsetText visuallyHiddenText={false}>
            <p>{insetText}</p>
          </InsetText>
          <p>
            <Link
              href='/choose-a-template-type'
              data-testid='back-to-choose-template-type-link'
            >
              {backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
