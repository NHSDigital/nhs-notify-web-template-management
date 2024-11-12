'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import { EmailTemplate, PageComponentProps } from '@utils/types';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { ChevronLeftIcon } from 'nhsuk-react-components';
import { renderMarkdown, reviewEmailTemplateAction } from './server-actions';

export function ReviewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const {
    components: {
      reviewEmailTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  const [state, action] = useFormState(reviewEmailTemplateAction, initialState);

  const templateName = initialState.name;
  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;

  const html = renderMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-back-link nhsuk-u-margin-bottom-6 nhsuk-u-margin-left-3'>
        <Link
          href={`/create-email-template/${initialState.id}`}
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
            formId: 'review-email-template',
            radiosId: 'reviewEmailTemplateAction',
          }}
          PreviewComponent={
            <PreviewTemplate.Email
              subject={templateSubjectLine}
              message={html}
            />
          }
        />
      </div>
    </div>
  );
}
