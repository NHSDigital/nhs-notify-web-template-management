'use client';

import { FC, useActionState } from 'react';
import { WarningCallout } from 'nhsuk-react-components';
import content from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useFeatureFlags } from '@providers/client-config-provider';
import { ActionPageProps } from 'nhs-notify-web-template-management-utils';

export const SubmitLetterTemplateProofingDisabled: FC<
  Omit<ActionPageProps, 'channel'> & {
    action: (payload: FormData) => void;
  }
> = ({ templateName, templateId, action, lockNumber }) => {
  const {
    proofingFlagDisabled: {
      afterSubmissionHeading,
      afterSubmissionText,
      continueButtonText,
      goBackButtonText,
      goBackPath,
      pageHeading,
      submitChecklistHeading,
      submitChecklistIntroduction,
      submitChecklistItems,
      warningCalloutText,
      warningCalloutLabel,
    },
  } = content.components.submitLetterTemplate;

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1>
            {pageHeading} {`'${templateName}'`}
          </h1>

          <h2 className='nhsuk-heading-s'>{submitChecklistHeading}</h2>
          <p>{submitChecklistIntroduction}</p>
          <ul className='nhsuk-list nhsuk-list--bullet'>
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
            <p>{warningCalloutText}</p>
          </WarningCallout>

          <NHSNotifyFormWrapper formId='submit-template-form' action={action}>
            <input
              type='hidden'
              name='templateId'
              value={templateId}
              readOnly
            />
            <input
              type='hidden'
              name='lockNumber'
              value={lockNumber}
              readOnly
            />
            <NHSNotifyButton
              id='submit-template-button'
              className='nhsuk-u-margin-right-3'
            >
              {continueButtonText}
            </NHSNotifyButton>
            <NHSNotifyButton
              secondary
              href={`${getBasePath()}/${goBackPath}/${templateId}`}
              data-testid='back-link-bottom'
            >
              {goBackButtonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};

export const SubmitLetterTemplate: FC<Omit<ActionPageProps, 'channel'>> = ({
  templateName,
  templateId,
  lockNumber,
}) => {
  const features = useFeatureFlags();

  const {
    routingFlagEnabled,
    routingFlagDisabled,
    goBackButtonText,
    goBackPath,
    submitChecklistIntroduction,
    submitChecklistItems,
    warningCalloutLabel,
  } = content.components.submitLetterTemplate;

  const [_, action] = useActionState(submitTemplate, 'LETTER');

  const pageContent = features.routing
    ? routingFlagEnabled
    : routingFlagDisabled;

  const {
    pageHeading,
    leadParagraph,
    submitChecklistHeading,
    warningCalloutText,
    continueButtonText,
  } = pageContent;

  if (!features.proofing) {
    return (
      <SubmitLetterTemplateProofingDisabled
        templateName={templateName}
        templateId={templateId}
        action={action}
        lockNumber={lockNumber}
      />
    );
  }

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1>
            {pageHeading} {`'${templateName}'`}
          </h1>
          <p className='nhsuk-body-l'>{leadParagraph}</p>
          <h2 className='nhsuk-heading-s'>{submitChecklistHeading}</h2>
          <p>{submitChecklistIntroduction}</p>
          <ul className='nhsuk-list nhsuk-list--bullet'>
            {submitChecklistItems.map((item) => (
              <li key={`submit-list-${item.slice(0, 5)}`}>{item}</li>
            ))}
          </ul>
          <WarningCallout>
            <WarningCallout.Label headingLevel='h2'>
              {warningCalloutLabel}
            </WarningCallout.Label>
            <p>{warningCalloutText}</p>
          </WarningCallout>
          <NHSNotifyFormWrapper formId='submit-template-form' action={action}>
            <input
              type='hidden'
              name='templateId'
              value={templateId}
              readOnly
            />
            <input
              type='hidden'
              name='lockNumber'
              value={lockNumber}
              readOnly
            />
            <NHSNotifyButton
              id='submit-template-button'
              className='nhsuk-u-margin-right-3'
            >
              {continueButtonText}
            </NHSNotifyButton>
            <NHSNotifyButton
              secondary
              id='go-back-button'
              href={`${getBasePath()}/${goBackPath}/${templateId}`}
              data-testid='back-link-bottom'
            >
              {goBackButtonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
