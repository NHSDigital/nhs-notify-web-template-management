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
    sentMessages,
    notSentMessages,
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

          <dl>
            <dt className='nhsuk-heading-xs nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-1'>
              {templateNameHeading}
            </dt>
            <dd id='template-name' className='nhsuk-body-s nhsuk-u-margin-left-0'>{templateName}</dd>
            <dt className='nhsuk-heading-xs nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-1'>
              {templateIdHeading}
            </dt>
            <dd id='template-id' className='nhsuk-body-s nhsuk-u-margin-left-0'>{templateId}</dd>
          </dl>

          <h2 className='nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-6'>{doNextHeading}</h2>
          <h3 className='nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-3'>{sentMessages.heading}</h3>
          <p>{sentMessages.paragraph1}</p>
          <p>{sentMessages.paragraph2}</p>
          <h3 className='nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-3'>{notSentMessages.heading}</h3>
          <p>
            <a href={notSentMessages.embeddedLink.href}>
              {notSentMessages.embeddedLink.text}
            </a>
            {notSentMessages.paragraph1}
          </p>
          <p>{notSentMessages.paragraph2}</p>
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
