'use client';

import Link from 'next/link';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import {
  PreviewDigitalTemplate,
  PreviewDigitalTemplateEditOnly,
} from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  ErrorState,
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { useActionState, useState } from 'react';
import { renderSMSMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $FormSchema, previewSmsTemplateAction } from './server-actions';
import { validate } from '@utils/client-validate-form';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export function PreviewSMSTemplate({
  initialState,
  routing,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const searchParams = useSearchParams();

  const { sectionHeading, form, backLinkText, headerCaption } =
    content.components.previewSMSTemplate;

  const [state, action] = useActionState(
    previewSmsTemplateAction,
    initialState
  );

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($FormSchema, setErrorState);

  const templateMessage = initialState.message;
  const html = renderSMSMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  const EditOnlyPreview = (
    <PreviewDigitalTemplateEditOnly
      template={initialState}
      sectionHeading={isFromEditPage ? sectionHeading : undefined}
      editPath={`/edit-text-message-template/${initialState.id}`}
      previewDetailsComponent={
        <PreviewTemplateDetailsSms
          template={initialState}
          message={html}
          caption={headerCaption}
        />
      }
    />
  );

  const EditSubmitPreview = (
    <PreviewDigitalTemplate
      template={initialState}
      sectionHeading={isFromEditPage ? sectionHeading : undefined}
      form={{
        ...form,
        state: {
          errorState,
        },
        action,
        formId: 'preview-sms-template',
        radiosId: 'previewSMSTemplateAction',
        formAttributes: { onSubmit: formValidate },
      }}
      previewDetailsComponent={
        <PreviewTemplateDetailsSms template={initialState} message={html} />
      }
    />
  );

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
            {routing ? EditOnlyPreview : EditSubmitPreview}
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
