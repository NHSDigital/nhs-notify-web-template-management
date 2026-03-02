'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import content from '@content/content';
import { RENDER_TIMEOUT_MS, useTemplatePoll } from '@hooks/use-template-poll';

type PreviewAuthoringLetterTemplateProps = {
  template: AuthoringLetterTemplate;
};

const shouldPollInitialRender = (t: AuthoringLetterTemplate) =>
  t.files.initialRender.status === 'PENDING' &&
  !isRenderAlreadyStale(t, RENDER_TIMEOUT_MS);

export function isRenderAlreadyStale(
  template: AuthoringLetterTemplate,
  timeoutMs: number
): boolean {
  const { initialRender } = template.files;

  if (initialRender.status !== 'PENDING') return false;

  const elapsed = Date.now() - new Date(initialRender.requestedAt).getTime();

  return elapsed >= timeoutMs;
}

export function PreviewAuthoringLetterTemplate({
  template,
}: Readonly<PreviewAuthoringLetterTemplateProps>) {
  const { backLinkText, links, submitText, loadingText } =
    content.components.previewLetterTemplate;

  const [latestTemplate, setLatestTemplate] =
    useState<AuthoringLetterTemplate>(template);

  const onUpdate = useCallback(
    (t: AuthoringLetterTemplate) => setLatestTemplate(t),
    []
  );

  const { isPolling } = useTemplatePoll({
    initialTemplate: template,
    shouldPoll: shouldPollInitialRender,
    onUpdate,
  });

  if (isPolling) {
    return <LoadingSpinner text={loadingText} />;
  }

  const showRenderer = latestTemplate.files.initialRender.status === 'RENDERED';

  const showSubmitForm = latestTemplate.templateStatus === 'NOT_YET_SUBMITTED';

  return (
    <>
      <div className='nhsuk-width-container'>
        <NHSNotifyBackLink href={links.messageTemplates}>
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
          <Link href={links.messageTemplates}>{backLinkText}</Link>
        </p>
      </NHSNotifyMain>
    </>
  );
}
