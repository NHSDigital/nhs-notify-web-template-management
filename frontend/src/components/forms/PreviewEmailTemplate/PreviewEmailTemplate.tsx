'use client';

import Link from 'next/link';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  EmailTemplate,
  ErrorState,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { useActionState, useState } from 'react';
import { renderEmailMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $FormSchema, previewEmailTemplateAction } from './server-actions';
import { validate } from '@utils/client-validate-form';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export function PreviewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const searchParams = useSearchParams();

  const { form, sectionHeading, backLinkText } =
    content.components.previewEmailTemplate;

  const [state, action] = useActionState(
    previewEmailTemplateAction,
    initialState
  );

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($FormSchema, setErrorState);

  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;
  const html = renderEmailMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <NotifyBackLink id='back-link' data-testid='back-to-templates-link'>
          {backLinkText}
        </NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewDigitalTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state: {
                  errorState,
                },
                action,
                formId: 'preview-email-template',
                radiosId: 'previewEmailTemplateAction',
                formAttributes: { onSubmit: formValidate },
              }}
              previewDetailsComponent={
                <PreviewTemplateDetailsEmail
                  template={initialState}
                  subject={templateSubjectLine}
                  message={html}
                />
              }
            />
            <p>
              <Link
                href='/message-templates'
                data-testid='back-to-templates-link-bottom'
              >
                {backLinkText}
              </Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
