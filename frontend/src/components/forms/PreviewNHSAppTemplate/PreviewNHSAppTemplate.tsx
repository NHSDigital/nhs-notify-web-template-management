'use client';

import Link from 'next/link';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import {
  PreviewDigitalTemplate,
  PreviewDigitalTemplateEditOnly,
} from '@organisms/PreviewDigitalTemplate';
import {
  ErrorState,
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { useActionState, useState } from 'react';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { previewNhsAppTemplateAction, schema } from './server-action';
import { validate } from '@utils/client-validate-form';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export function PreviewNHSAppTemplate({
  initialState,
  routingEnabled,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const searchParams = useSearchParams();

  const [state, action] = useActionState(
    previewNhsAppTemplateAction,
    initialState
  );

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate(schema, setErrorState);

  const { message } = state;
  const html = renderNHSAppMarkdown(message);
  const isFromEditPage = searchParams.get('from') === 'edit';

  const { sectionHeading, form, backLinkText } =
    content.components.previewNHSAppTemplate;

  const EditOnlyPreview = (
    <PreviewDigitalTemplateEditOnly
      template={initialState}
      sectionHeading={isFromEditPage ? sectionHeading : undefined}
      editPath={`/edit-nhs-app-template/${initialState.id}`}
      previewDetailsComponent={
        <PreviewTemplateDetailsNhsApp template={initialState} message={html} />
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
        formId: 'preview-nhs-app-template',
        radiosId: 'previewNHSAppTemplateAction',
        formAttributes: { onSubmit: formValidate },
      }}
      previewDetailsComponent={
        <PreviewTemplateDetailsNhsApp template={initialState} message={html} />
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
            {routingEnabled ? EditOnlyPreview : EditSubmitPreview}
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
