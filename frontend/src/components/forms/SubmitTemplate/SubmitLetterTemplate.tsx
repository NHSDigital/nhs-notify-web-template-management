'use client';

import { FC, useActionState } from 'react';
import { WarningCallout } from 'nhsuk-react-components';
import content from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

export const SubmitLetterTemplate: FC<{
  templateName: string;
  templateId: string;
}> = ({ templateName, templateId }) => {
  const {
    pageHeading,
    warningCalloutLabel,
    warningCalloutChecklistIntroduction,
    warningCalloutChecklistItems,
    submitChecklistHeading,
    submitChecklistIntroduction,
    submitChecklistItems,
    goBackButtonText,
    goBackPath,
    buttonText,
    afterSubmissionHeading,
    afterSubmissionText,
  } = content.components.submitLetterTemplate;

  const [_, action] = useActionState(submitTemplate, 'LETTER');

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1>
            {pageHeading} {`'${templateName}'`}
          </h1>
          <h2 className='nhsuk-heading-s'>{submitChecklistHeading}</h2>
          <p>{submitChecklistIntroduction}</p>
          <ul>
            {submitChecklistItems.map((item) => (
              <li key={`submit-list-${item.slice(0, 5)}`}>{item}</li>
            ))}
          </ul>
          <h2 className='nhsuk-heading-s'>{afterSubmissionHeading}</h2>
          {afterSubmissionText.map((item) => (
            <p key={`after-submission-paragraph-${item.slice(0, 5)}`}>{item}</p>
          ))}
          <WarningCallout>
            <WarningCallout.Label headingLevel='h2'>
              {warningCalloutLabel}
            </WarningCallout.Label>
            <p>{warningCalloutChecklistIntroduction}</p>
            <ul>
              {warningCalloutChecklistItems.map((item) => (
                <li key={`warning-callout-list-${item.slice(0, 5)}`}>{item}</li>
              ))}
            </ul>
          </WarningCallout>
          <NHSNotifyFormWrapper formId='submit-template-form' action={action}>
            <input
              type='hidden'
              name='templateId'
              value={templateId}
              readOnly
            />
            <NHSNotifyButton
              secondary
              id='go-back-button'
              className='nhsuk-u-margin-right-3'
              href={`${getBasePath()}/${goBackPath}/${templateId}`}
            >
              {goBackButtonText}
            </NHSNotifyButton>
            <NHSNotifyButton id='submit-template-button'>
              {buttonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
