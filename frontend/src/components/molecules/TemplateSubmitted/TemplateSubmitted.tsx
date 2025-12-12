'use client';

import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import React from 'react';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

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
    doNextParagraphs,
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
            <dd
              id='template-name'
              className='nhsuk-body-s nhsuk-u-margin-left-0'
            >
              {templateName}
            </dd>
            <dt className='nhsuk-heading-xs nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-1'>
              {templateIdHeading}
            </dt>
            <dd id='template-id' className='nhsuk-body-s nhsuk-u-margin-left-0'>
              {templateId}
            </dd>
          </dl>

          <h2 className='nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-6'>
            {doNextHeading}
          </h2>
          {doNextParagraphs.map(({ heading, text }, index) => {
            return (
              <React.Fragment key={`do-next-section-${index}`}>
                <h3 className='nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-3'>
                  {heading}
                </h3>
                <MarkdownContent content={text} />
              </React.Fragment>
            );
          })}
          <hr className='nhsuk-section-break--visible' />
          <p>
            <Link data-testid='back-link-bottom' href='/message-templates'>
              {backLinkText}
            </Link>
          </p>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
