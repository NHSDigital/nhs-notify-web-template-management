'use client';

import { FC } from 'react';
import { WarningCallout, Button } from 'nhsuk-react-components';
import { SubmitTemplatePageComponentProps } from 'nhs-notify-web-template-management-utils';
import { submitTemplateContent } from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export const SubmitTemplate: FC<SubmitTemplatePageComponentProps> = ({
  templateName,
  templateId,
  goBackPath,
  submitPath,
}) => {
  const {
    pageHeading,
    warningCalloutLabel,
    warningCalloutText,
    submitChecklistHeading,
    submitChecklistIntroduction,
    submitChecklistItems,
    submitChecklistParagraphs,
    goBackButtonText,
    buttonText,
  } = submitTemplateContent;

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
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
            action={submitTemplate.bind(null, submitPath)}
          >
            <input
              type='hidden'
              name='templateId'
              value={templateId}
              readOnly
            />
            <Button
              preventDoubleClick
              secondary
              id='go-back-button'
              className='nhsuk-u-margin-right-3'
              href={`${getBasePath()}/${goBackPath}/${templateId}`}
            >
              {goBackButtonText}
            </Button>
            <Button preventDoubleClick id='submit-template-button'>{buttonText}</Button>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
