'use client';

import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';

type TemplateSubmittedProps = {
  templateId: string;
  templateName: string;
};

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
    notLiveHeading,
    notLiveText,
    liveHeading,
    liveLinkText,
    liveText,
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
          <h2 className='nhsuk-u-margin-top-5'>{doNextHeading}</h2>
          <h3>{notLiveHeading}</h3>
          <p>{notLiveText}</p>
          <h3>{liveHeading}</h3>
          <p>
            {liveText}{' '}
            <Link
              id='servicenow-link'
              href='https://nhsdigitallive.service-now.com/nhs_digital?id=sc_cat_item&sys_id=6208dbce1be759102eee65b9bd4bcbf5'
              target='_blank'
              rel='noopener noreferrer'
            >
              {liveLinkText}
            </Link>
          </p>
          <hr className='nhsuk-section-break--visible' />
          <p>
            <Link id='go-back-link' href='/manage-templates'>
              {backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
