'use client';

import Link from 'next/link';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import content from '@content/content';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { isRightToLeft } from 'nhs-notify-web-template-management-utils/enum';
import { getBasePath } from '@utils/get-base-path';
import { Details, WarningCallout } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { TemplateStatus } from 'nhs-notify-backend-client';
import classNames from 'classnames';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { useFeatureFlags } from '@providers/client-config-provider';

type ButtonDetails = { text: string; href: string };

export function PreviewLetterTemplate({
  template,
}: Readonly<{ template: LetterTemplate }>) {
  const {
    approveProofText,
    backLinkText,
    footer,
    preSubmissionText,
    requestProofText,
    rtlWarning,
    submitText,
    validationError,
    validationErrorAction,
    virusScanError,
    virusScanErrorAction,
  } = content.components.previewLetterTemplate;

  const basePath = getBasePath();
  const { routing } = useFeatureFlags();

  const buttonMap: Record<string, ButtonDetails> = {
    NOT_YET_SUBMITTED: {
      text: submitText,
      href: `${basePath}/submit-letter-template/${template.id}`,
    },
    PROOF_AVAILABLE: {
      text: routing ? approveProofText : submitText,
      href: `${basePath}/submit-letter-template/${template.id}`,
    },
    PENDING_PROOF_REQUEST: {
      text: requestProofText,
      href: `${basePath}/request-proof-of-template/${template.id}`,
    },
  } satisfies Partial<Record<TemplateStatus, ButtonDetails>>;

  const errors: string[] = [];
  if (template.templateStatus === 'VIRUS_SCAN_FAILED') {
    errors.push(virusScanError, virusScanErrorAction);
  }

  if (template.templateStatus === 'VALIDATION_FAILED') {
    errors.push(validationError, validationErrorAction);
  }

  const continueButton = buttonMap[template.templateStatus];

  const footerText = footer[template.templateStatus] ?? [];

  return (
    <>
      <Link href='/message-templates' id='back-link' passHref legacyBehavior>
        <NotifyBackLink>{backLinkText}</NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {errors.length > 0 && (
              <NhsNotifyErrorSummary
                errorState={{
                  formErrors: errors,
                }}
              />
            )}
            <PreviewTemplateDetailsLetter template={template} />

            {template.templateStatus === 'PROOF_AVAILABLE' ? (
              <section className='nhsuk-u-reading-width'>
                <Details>
                  <Details.Summary>
                    {preSubmissionText.ifDoesNotMatch.summary}
                  </Details.Summary>
                  <Details.Text>
                    {(routing
                      ? preSubmissionText.ifDoesNotMatch.paragraphsApproval
                      : preSubmissionText.ifDoesNotMatch.paragraphsSubmit
                    ).map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                  </Details.Text>
                </Details>
                <Details>
                  <Details.Summary>
                    {preSubmissionText.ifNeedsEdit.summary}
                  </Details.Summary>
                  <Details.Text>
                    <p>{preSubmissionText.ifNeedsEdit.paragraph}</p>
                  </Details.Text>
                </Details>
                <p>
                  {routing
                    ? preSubmissionText.ifYouAreHappyParagraphApproval
                    : preSubmissionText.ifYouAreHappyParagraphSubmit}
                </p>
              </section>
            ) : null}

            {footerText.length > 0 ? (
              <div
                className={classNames(
                  'preview-letter-footer',
                  'nhsuk-u-margin-bottom-6'
                )}
              >
                {footerText.map((item, i) => (
                  <p key={`footer-${i}`}>{item}</p>
                ))}
              </div>
            ) : null}

            {isRightToLeft(template.language) && (
              <div className='nhsuk-grid-row'>
                <div className='nhsuk-grid-column-two-thirds'>
                  <WarningCallout
                    data-testid='rtl-language-warning'
                    aria-live='polite'
                    className='nhsuk-u-margin-top-3'
                  >
                    <WarningCallout.Label headingLevel='h2'>
                      {rtlWarning.heading}
                    </WarningCallout.Label>
                    <p>{rtlWarning.text1}</p>
                    <p>{rtlWarning.text2}</p>
                    <p>{rtlWarning.text3}</p>
                  </WarningCallout>
                </div>
              </div>
            )}

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
