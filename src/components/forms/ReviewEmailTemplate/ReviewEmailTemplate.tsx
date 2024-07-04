'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export type ReviewEmailTemplateProps = {
  templateName: string;
  subject: string;
  message: string;
};

export function ReviewEmailTemplate({
  templateName,
  subject,
  message,
}: ReviewEmailTemplateProps) {
  const {
    components: {
      reviewEmailTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          templateName={templateName}
          sectionHeading={sectionHeading}
          details={details}
          form={{
            ...form,
            action: '',
            state: {
              page: 'choose-template',
              nhsAppTemplateName: '',
              nhsAppTemplateMessage: '',
              validationError: null,
            },
            formId: 'review-email-template',
            radiosId: 'reviewEmailTemplateAction',
          }}
          PreviewComponent={
            <PreviewTemplate.Email subject={subject} value={html} />
          }
        />
      </div>
    </div>
  );
}
