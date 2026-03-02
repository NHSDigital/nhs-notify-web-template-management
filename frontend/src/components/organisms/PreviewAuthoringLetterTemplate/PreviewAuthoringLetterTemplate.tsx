'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { DEFAULT_TIMEOUT_MS, useTemplatePoll } from '@hooks/use-template-poll';

type PreviewAuthoringLetterTemplateProps = {
  template: AuthoringLetterTemplate;
  backLinkText: string;
  backLinkHref: string;
  submitText: string;
  loadingText: string;
};

const shouldPollInitialRender = (t: TemplateDto) =>
  t.templateType === 'LETTER' &&
  t.letterVersion === 'AUTHORING' &&
  t.files.initialRender.status === 'PENDING';

export function isRenderAlreadyStale(
  template: AuthoringLetterTemplate,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): boolean {
  const { initialRender } = template.files;

  if (initialRender.status !== 'PENDING') return false;

  const elapsed = Date.now() - new Date(initialRender.requestedAt).getTime();

  return elapsed >= timeoutMs;
}

export function PreviewAuthoringLetterTemplate({
  template,
  backLinkText,
  backLinkHref,
  submitText,
  loadingText,
}: Readonly<PreviewAuthoringLetterTemplateProps>) {
  const [latestTemplate, setLatestTemplate] =
    useState<AuthoringLetterTemplate>(template);

  const needsPolling =
    latestTemplate.files.initialRender.status === 'PENDING' &&
    !isRenderAlreadyStale(template);

  const onUpdate = useCallback(
    (t: TemplateDto) => setLatestTemplate(t as AuthoringLetterTemplate),
    []
  );

  const { isPolling } = useTemplatePoll({
    templateId: template.id,
    shouldPoll: shouldPollInitialRender,
    onUpdate,
    enabled: needsPolling,
  });

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
