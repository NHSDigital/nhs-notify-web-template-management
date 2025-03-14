'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import { PreviewTemplate } from '@organisms/PreviewTemplate';
import content from '@content/content';
import {
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { useActionState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { renderSMSMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { previewSmsTemplateAction } from './server-actions';
import PageTitle from '@hooks/page-title.hook';

export function PreviewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const searchParams = useSearchParams();

  const { sectionHeading, form, backLinkText, pageTitle } =
    content.components.previewSMSTemplate;

  PageTitle(pageTitle);

  const [state, action] = useActionState(
    previewSmsTemplateAction,
    initialState
  );
  const templateMessage = initialState.message;
  const html = renderSMSMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`} id='back-link'>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state,
                action,
                formId: 'preview-sms-template',
                radiosId: 'previewSMSTemplateAction',
              }}
              previewDetailsComponent={
                <PreviewTemplateDetails.Sms
                  template={initialState}
                  message={html}
                />
              }
            />
            <p>
              <Link href='/manage-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
