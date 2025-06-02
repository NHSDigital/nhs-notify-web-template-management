'use client';

import Link from 'next/link';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  FormErrorState,
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { useActionState, useState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { renderSMSMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $FormSchema, previewSmsTemplateAction } from './server-actions';
import { validate } from '@utils/client-validate-form';

export function PreviewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const searchParams = useSearchParams();

  const { sectionHeading, form, backLinkText } =
    content.components.previewSMSTemplate;

  const [state, action] = useActionState(
    previewSmsTemplateAction,
    initialState
  );

  const [validationError, setValidationError] = useState<
    FormErrorState | undefined
  >(state.validationError);

  const formValidate = validate($FormSchema, setValidationError);

  const templateMessage = initialState.message;
  const html = renderSMSMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <BackLink
        href={`${getBasePath()}/message-templates`}
        id='back-link'
        data-testid='back-to-templates-link'
      >
        {backLinkText}
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
                formId: 'preview-sms-template',
                radiosId: 'previewSMSTemplateAction',
                formAttributes: { onSubmit: formValidate },
              }}
              previewDetailsComponent={
                <PreviewTemplateDetailsSms
                  template={initialState}
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
