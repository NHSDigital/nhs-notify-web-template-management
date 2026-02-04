'use client';

import Link from 'next/link';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import content from '@content/content';
import type {
  AuthoringLetterTemplate,
  LetterTemplate,
  PdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
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
import { interpolate } from '@utils/interpolate';

type ButtonDetails = { text: string; href: string };

export function PreviewLetterTemplate({
  template,
}: Readonly<{ template: LetterTemplate }>) {
  return template.letterVersion === 'PDF' ? (
    <PreviewPdfLetterTemplate template={template} />
  ) : (
    <PreviewAuthoringLetterTemplate template={template} />
  );
}

function PreviewPdfLetterTemplate({
  template,
}: Readonly<{ template: PdfLetterTemplate }>) {
  const {
    approveProofText,
    backLinkText,
    footer,
    links,
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
      href: interpolate(links.submitLetterTemplate, {
        basePath,
        templateId: template.id,
        lockNumber: template.lockNumber,
      }),
    },
    PROOF_AVAILABLE: {
      text: routing ? approveProofText : submitText,
      href: interpolate(links.submitLetterTemplate, {
        basePath,
        templateId: template.id,
        lockNumber: template.lockNumber,
      }),
    },
    PENDING_PROOF_REQUEST: {
      text: requestProofText,
      href: interpolate(links.requestProofOfTemplate, {
        basePath,
        templateId: template.id,
        lockNumber: template.lockNumber,
      }),
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
      <Link href={links.messageTemplates} passHref legacyBehavior>
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
              <Link href={links.messageTemplates}>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}

function PreviewAuthoringLetterTemplate({
  template,
}: Readonly<{ template: AuthoringLetterTemplate }>) {
  const {
    backLinkText,
    links,
    validationError,
    validationErrorAction,
    virusScanError,
    virusScanErrorAction,
  } = content.components.previewLetterTemplate;

  const errors: string[] = [];
  if (template.templateStatus === 'VIRUS_SCAN_FAILED') {
    errors.push(virusScanError, virusScanErrorAction);
  }

  if (template.templateStatus === 'VALIDATION_FAILED') {
    errors.push(validationError, validationErrorAction);
  }

  return (
    <>
      <Link href={links.messageTemplates} passHref legacyBehavior>
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
            <PreviewTemplateDetailsAuthoringLetter template={template} />
            <p>
              <Link href={links.messageTemplates}>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
