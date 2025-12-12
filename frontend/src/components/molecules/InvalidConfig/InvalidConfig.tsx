'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { InsetText } from 'nhsuk-react-components';
import Link from 'next/link';

type InvalidConfigPageProps = {
  heading: string;
  text: string;
  insetText: string;
  backLinkText: string;
  backLinkUrl: string;
};

export default function InvalidConfig({
  heading,
  text,
  insetText,
  backLinkText,
  backLinkUrl,
}: InvalidConfigPageProps) {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {heading}
          </h1>
          <p>{text}</p>
          <InsetText visuallyHiddenText={false}>
            <p>{insetText}</p>
          </InsetText>
          <p>
            <Link href={backLinkUrl} data-testid='back-link-bottom'>
              {backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
