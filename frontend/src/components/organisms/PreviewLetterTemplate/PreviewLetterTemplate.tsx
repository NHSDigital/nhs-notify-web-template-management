'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import content from '@content/content';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

export function PreviewLetterTemplate({
  template,
}: Readonly<{ template: LetterTemplate }>) {
  const { backLinkText, submitText, requestProofText } =
    content.components.previewLetterTemplate;
  const buttonText =
    template.templateStatus === 'PENDING_PROOF_REQUEST'
      ? requestProofText
      : submitText;

  const basePath = getBasePath();

  return (
    <>
      <BackLink href={`${basePath}/message-templates`} id='back-link'>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetails.Letter template={template} />
            <NHSNotifyButton
              data-testid='preview-letter-template-cta'
              id='preview-letter-template-cta'
              href={`${basePath}/submit-letter-template/${template.id}`}
            >
              {buttonText}
            </NHSNotifyButton>
            <p>
              <Link href='/message-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
