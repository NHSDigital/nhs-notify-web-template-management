'use client';

import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';

type TemplateSubmittedProps = { templateId: string; templateName: string };

export const TemplateSubmitted = ({
  templateId,
  templateName,
}: TemplateSubmittedProps) => {
  const {
    backLinkText,
    pageHeading,
    templateNameHeading,
    templateIdHeading,
    doNextHeading,
    doNextText,
  } = content.components.templateSubmitted;

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <div className='notify-confirmation-panel'>
            <h1
              id='template-submitted'
              className='nhsuk-heading-l nhsuk-u-margin-bottom-0'
            >
              {pageHeading}
            </h1>
          </div>
          <h2 className='nhsuk-heading-xs nhsuk-u-margin-bottom-1'>
            {templateNameHeading}
          </h2>
          <p id='template-name'>{templateName}</p>
          <h2 className='nhsuk-heading-xs nhsuk-u-margin-bottom-1'>
            {templateIdHeading}
          </h2>
          <p id='template-id'>{templateId}</p>
          <h3 className='nhsuk-u-margin-top-5'>{doNextHeading}</h3>
          <p>{doNextText}</p>
          <hr className='nhsuk-section-break--visible' />
          <p>
            <Link id='go-back-link' href='/message-templates'>
              {backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
