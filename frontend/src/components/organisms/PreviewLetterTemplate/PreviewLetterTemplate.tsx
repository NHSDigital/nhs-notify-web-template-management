'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import content from '@content/content';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { BackLink, ErrorSummary, ErrorMessage } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

export function PreviewLetterTemplate({
  template,
}: Readonly<{ template: LetterTemplate }>) {
  const {
    backLinkText,
    buttonText,
    errorHeading,
    virusScanError,
    virusScanErrorAction,
    validationError,
    validationErrorAction,
  } = content.components.previewLetterTemplate;
  const basePath = getBasePath();

  const errors = [];
  if (template.templateStatus === 'VIRUS_SCAN_FAILED') {
    errors.push(virusScanError, virusScanErrorAction);
  }

  if (template.templateStatus === 'VALIDATION_FAILED') {
    errors.push(validationError, validationErrorAction);
  }

  return (
    <>
      <BackLink href={`${basePath}/message-templates`} id='back-link'>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {errors.length > 0 && (
              <ErrorSummary>
                <ErrorSummary.Title data-testid='error-summary'>
                  {errorHeading}
                </ErrorSummary.Title>
                {errors.map((error, i) => (
                  <ErrorMessage key={`error-summary-${i}`}>
                    {error}
                  </ErrorMessage>
                ))}
              </ErrorSummary>
            )}
            <PreviewTemplateDetails.Letter template={template} />
            {template.templateStatus === 'NOT_YET_SUBMITTED' && (
              <NHSNotifyButton
                data-testid='submit-button'
                id='preview-letter-template-submit-button'
                href={`${basePath}/submit-letter-template/${template.id}`}
              >
                {buttonText}
              </NHSNotifyButton>
            )}
            <p>
              <Link href='/message-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
