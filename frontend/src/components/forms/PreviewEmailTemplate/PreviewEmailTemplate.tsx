'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import { PreviewTemplate } from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  EmailTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { useActionState } from 'react';
import { getBasePath } from '@utils/get-base-path';
import { renderEmailMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { previewEmailTemplateAction } from './server-actions';

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

  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;
  const html = renderEmailMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`} id='back-link'>
        Back to all templates
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
                formId: 'preview-email-template',
                radiosId: 'previewEmailTemplateAction',
              }}
              previewDetailsComponent={
                <PreviewTemplateDetails.Email
                  template={initialState}
                  subject={templateSubjectLine}
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
