'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type {
  AuthoringLetterTemplate,
  LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { getBasePath } from '@utils/get-base-path';

const POLL_INTERVAL_MS = 1500;

type AuthoringPreviewContentProps = {
  template: AuthoringLetterTemplate;
  backLinkText: string;
  backLinkHref: string;
  submitText: string;
  loadingText: string;
};

function isAuthoringLetterTemplate(
  value: LetterTemplate
): value is AuthoringLetterTemplate {
  return value.templateType === 'LETTER' && value.letterVersion === 'AUTHORING';
}

export function AuthoringPreviewContent({
  template,
  backLinkText,
  backLinkHref,
  submitText,
  loadingText,
}: Readonly<AuthoringPreviewContentProps>) {
  const [latestTemplate, setLatestTemplate] =
    useState<AuthoringLetterTemplate>(template);

  const isPolling = latestTemplate.files.initialRender?.status === 'PENDING';

  useEffect(() => {
    if (!isPolling) return;

    let isActive = true;

    const pollTemplate = async () => {
      try {
        // axios?
        const response = await fetch(
          `${getBasePath()}/preview-letter-template/${template.id}/poll`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok || !isActive) return;

        const nextTemplate = (await response.json()) as LetterTemplate;

        if (isAuthoringLetterTemplate(nextTemplate)) {
          setLatestTemplate(nextTemplate);
        }
      } catch {
        return;
      }
    };

    const pollTimerId = setInterval(() => {
      void pollTemplate();
    }, POLL_INTERVAL_MS);

    void pollTemplate();

    return () => {
      isActive = false;
      clearInterval(pollTimerId);
    };
  }, [isPolling, template.id]);

  if (isPolling) {
    return <LoadingSpinner text={loadingText} />;
  }

  const showRenderer = latestTemplate.files.initialRender.status === 'RENDERED';

  const showSubmitForm = latestTemplate.templateStatus === 'NOT_YET_SUBMITTED';

  return (
    <>
      <div className='nhsuk-width-container'>
        <NHSNotifyBackLink href={backLinkHref}>
          {backLinkText}
        </NHSNotifyBackLink>
      </div>
      <NHSNotifyMain>
        <div className='nhsuk-width-container'>
          <NHSNotifyForm.ErrorSummary />
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-full'>
              <PreviewTemplateDetailsAuthoringLetter
                template={latestTemplate}
              />
            </div>
          </div>
        </div>
        {showRenderer && <LetterRender template={latestTemplate} />}
        {showSubmitForm && (
          <NHSNotifyForm.Form formId='preview-letter-template'>
            <input type='hidden' name='templateId' value={latestTemplate.id} />
            <input
              type='hidden'
              name='lockNumber'
              value={latestTemplate.lockNumber}
            />
            <button
              type='submit'
              className='nhsuk-button'
              data-testid='preview-letter-template-cta'
              id='preview-letter-template-cta'
            >
              {submitText}
            </button>
          </NHSNotifyForm.Form>
        )}
        <p>
          <Link href={backLinkHref}>{backLinkText}</Link>
        </p>
      </NHSNotifyMain>
    </>
  );
}
