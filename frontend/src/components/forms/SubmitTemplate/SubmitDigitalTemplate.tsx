'use client';

import { FC, useActionState } from 'react';
import { WarningCallout } from 'nhsuk-react-components';
import {
  ActionPageProps,
  legacyTemplateTypeToUrlTextMappings,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

export const SubmitDigitalTemplate: FC<ActionPageProps> = ({
  templateName,
  templateId,
  channel,
  lockNumber,
}: ActionPageProps) => {
  const {
    pageHeading,
    warningCalloutLabel,
    warningCalloutText,
    submitChecklistHeading,
    submitChecklistIntroduction,
    submitChecklistItems,
    leadParagraph,
    goBackButtonText,
    buttonText,
  } = content.components.submitTemplate;

  const [_, action] = useActionState(submitTemplate, channel);

  const goBackPath = `preview-${legacyTemplateTypeToUrlTextMappings(channel)}-template`;

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1>
            {pageHeading} {`'${templateName}'`}
          </h1>

          <p className='nhsuk-body-l'>{leadParagraph}</p>

          <h2 className='nhsuk-heading-m'>{submitChecklistHeading}</h2>
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
              secondary
              className='nhsuk-u-margin-right-3'
              href={`${getBasePath()}/${goBackPath}/${templateId}`}
              data-testid='back-link-bottom'
            >
              {goBackButtonText}
            </NHSNotifyButton>
            <NHSNotifyButton
              id='submit-template-button'
              data-testid='submit-template-button'
            >
              {buttonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
