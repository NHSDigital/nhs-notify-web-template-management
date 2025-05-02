'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import content from '@content/content';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { BackLink, ErrorSummary, ErrorMessage } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { TemplateStatus } from 'nhs-notify-backend-client';

type ButtonDetails = { text: string; href: string };

export function PreviewLetterTemplate({
  template,
}: Readonly<{ template: LetterTemplate }>) {
  const {
    backLinkText,
    errorHeading,
    submitText,
    requestProofText,
    virusScanError,
    virusScanErrorAction,
    validationError,
    validationErrorAction,
  } = content.components.previewLetterTemplate;

  const basePath = getBasePath();

  const buttonMap: Record<string, ButtonDetails> = {
    NOT_YET_SUBMITTED: {
      text: submitText,
      href: `${basePath}/submit-letter-template/${template.id}`,
    },
    PENDING_PROOF_REQUEST: {
      text: requestProofText,
      href: `${basePath}/request-proof-of-template/${template.id}`,
    },
  } satisfies Partial<Record<TemplateStatus, ButtonDetails>>;

  const errors = [];
  if (template.templateStatus === 'VIRUS_SCAN_FAILED') {
    errors.push(virusScanError, virusScanErrorAction);
  }

  if (template.templateStatus === 'VALIDATION_FAILED') {
    errors.push(validationError, validationErrorAction);
  }

  const continueButton = buttonMap[template.templateStatus];

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
            {continueButton && (
              <NHSNotifyButton
                data-testid='preview-letter-template-cta'
                id='preview-letter-template-cta'
                href={continueButton.href}
              >
                {continueButton.text}
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
