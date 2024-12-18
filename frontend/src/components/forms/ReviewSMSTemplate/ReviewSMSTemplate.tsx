'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import {
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { renderSMSMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { reviewSmsTemplateAction } from './server-actions';

export function ReviewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const searchParams = useSearchParams();

  const {
    components: {
      reviewSMSTemplateContent: { sectionHeading, form },
    },
  } = content;

  const [state, action] = useFormState(reviewSmsTemplateAction, initialState);
  const templateMessage = initialState.message;
  const html = renderSMSMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <BackLink href={`${getBasePath()}/manage-templates`}>
          Back to all templates
        </BackLink>
        <ReviewTemplate
          template={initialState}
          sectionHeading={isFromEditPage ? sectionHeading : undefined}
          form={{
            ...form,
            state,
            action,
            formId: 'review-sms-template',
            radiosId: 'reviewSMSTemplateAction',
          }}
          PreviewComponent={
            <PreviewTemplate.Sms template={initialState} message={html} />
          }
        />
        <p>
          <Link href='/manage-templates'>Back to all templates</Link>
        </p>
      </div>
    </div>
  );
}
