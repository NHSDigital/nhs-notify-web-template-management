'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import { PageComponentProps, SMSTemplate } from '@utils/types';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { ChevronLeftIcon } from 'nhsuk-react-components';
import { renderMarkdown, reviewSmsTemplateAction } from './server-actions';

export function ReviewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const {
    components: {
      reviewSMSTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  const [state, action] = useFormState(reviewSmsTemplateAction, initialState);

  const templateName = initialState.name;
  const templateMessage = initialState.message;

  const html = renderMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-back-link nhsuk-u-margin-bottom-6 nhsuk-u-margin-left-3'>
        <Link
          href={`/create-text-message-template/${initialState.id}`}
          className='nhsuk-back-link__link'
        >
          <ChevronLeftIcon />
          Go back
        </Link>
      </div>
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          templateName={templateName}
          sectionHeading={sectionHeading}
          details={details}
          form={{
            ...form,
            state,
            action,
            formId: 'review-sms-template',
            radiosId: 'reviewSMSTemplateAction',
          }}
          PreviewComponent={<PreviewTemplate.Sms message={html} />}
        />
      </div>
    </div>
  );
}
