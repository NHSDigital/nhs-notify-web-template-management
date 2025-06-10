'use client';

import Link from 'next/link';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  EmailTemplate,
  FormErrorState,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { useActionState, useState } from 'react';
import { getBasePath } from '@utils/get-base-path';
import { renderEmailMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $FormSchema, previewEmailTemplateAction } from './server-actions';
import { validate } from '@utils/client-validate-form';

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

  const [validationError, setValidationError] = useState<
    FormErrorState | undefined
  >(state.validationError);

  const formValidate = validate($FormSchema, setValidationError);

  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;
  const html = renderEmailMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <BackLink
        href={`${getBasePath()}/message-templates`}
        id='back-link'
        data-testid='back-to-templates-link'
      >
        Back to all templates
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewDigitalTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state: {
                  validationError,
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
