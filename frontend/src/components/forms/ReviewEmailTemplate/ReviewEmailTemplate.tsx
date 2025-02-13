'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
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
import { reviewEmailTemplateAction } from './server-actions';

export function ReviewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const searchParams = useSearchParams();

  const {
    components: {
      reviewEmailTemplateContent: { sectionHeading, form },
    },
  } = content;

  const [state, action] = useActionState(
    reviewEmailTemplateAction,
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
            <ReviewTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state,
                action,
                formId: 'review-email-template',
                radiosId: 'reviewEmailTemplateAction',
              }}
              PreviewComponent={
                <PreviewTemplate.Email
                  template={initialState}
                  subject={templateSubjectLine}
                  message={html}
                />
              }
            />
            <p>
              <Link href='/manage-templates'>Back to all templates</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
