'use client';

import { FC } from 'react';
import { WarningCallout, Button, BackLink } from 'nhsuk-react-components';
import { SubmitTemplatePageComponentProps } from '@utils/types';
import { submitNhsAppTemplateContent } from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { submitTemplate } from './server-action';

export const SubmitTemplate: FC<SubmitTemplatePageComponentProps> = ({
  templateName,
  sessionId,
  goBackPath,
}) => {
  const {
    backLinkText,
    pageHeading,
    warningCalloutLabel,
    warningCalloutText,
    submitChecklistHeading,
    submitChecklistIntroduction,
    submitChecklistItems,
    submitChecklistParagraphs,
    buttonText,
  } = submitNhsAppTemplateContent;

  return (
    <div className='nhsuk-grid-row'>
      <BackLink
        href={`${getBasePath()}/${goBackPath}/${sessionId}`}
        className='nhsuk-u-margin-bottom-7 nhsuk-u-margin-left-3'
      >
        {backLinkText}
      </BackLink>
      <div className='nhsuk-grid-column-two-thirds'>
        <h1>
          {pageHeading} {`'${templateName}'`}
        </h1>
        <WarningCallout>
          <WarningCallout.Label headingLevel='h2'>
            {warningCalloutLabel}
          </WarningCallout.Label>
          <p>{warningCalloutText}</p>
        </WarningCallout>
        <h2 className='nhsuk-heading-m'>{submitChecklistHeading}</h2>
        <p>{submitChecklistIntroduction}</p>
        <ul>
          {submitChecklistItems.map((item) => (
            <li key={`submit-list-${item.slice(0, 5)}`}>{item}</li>
          ))}
        </ul>
        {submitChecklistParagraphs.map((item) => (
          <p key={`submit-paragraph-${item.slice(0, 5)}`}>{item}</p>
        ))}
        <NHSNotifyFormWrapper
          formId='submit-template-form'
          action={submitTemplate}
        >
          <input type='hidden' name='sessionId' value={sessionId} readOnly />
          <Button id='submit-template-button'>{buttonText}</Button>
        </NHSNotifyFormWrapper>
      </div>
    </div>
  );
};
