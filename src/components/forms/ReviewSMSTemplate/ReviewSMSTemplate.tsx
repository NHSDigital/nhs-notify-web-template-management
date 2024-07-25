'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@/src/content/content';
import { renderMarkdown } from './server-actions';

export type ReviewSMSTemplateProps = {
  templateName: string;
  message: string;
};

export function ReviewSMSTemplate({
  templateName,
  message,
}: Readonly<ReviewSMSTemplateProps>) {
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
              sessionId: 'session-id',
              page: 'choose-template',
              nhsAppTemplateName: '',
              nhsAppTemplateMessage: '',
              validationError: undefined,
            },
            formId: 'review-email-template',
            radiosId: 'reviewEmailTemplateAction',
          }}
          PreviewComponent={<PreviewTemplate.Sms message={html} />}
        />
      </div>
    </div>
  );
}
