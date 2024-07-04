'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export type ReviewSMSTemplateProps = {
  templateName: string;
  message: string;
};

export function ReviewSMSTemplate({
  templateName,
  message,
}: ReviewSMSTemplateProps) {
  const {
    components: {
      reviewSMSTemplateContent: { sectionHeading, details, form },
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
          PreviewComponent={<PreviewTemplate.SMS message={html} />}
        />
      </div>
    </div>
  );
}
