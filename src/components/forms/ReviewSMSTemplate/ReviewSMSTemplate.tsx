'use client';

import { PreviewTemplate } from '@/src/components/molecules/PreviewTemplate';
import { ReviewTemplate } from '@/src/components/organisms/ReviewTemplate';
import { ReviewSMSTemplateProps } from './ReviewSMSTemplate.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function ReviewSMSTemplate({
  templateName,
  message,
}: ReviewSMSTemplateProps) {
  const {
    components: { previewTextMessageFormComponent },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          sectionHeading={previewTextMessageFormComponent.sectionHeader}
          templateName={templateName}
          details={previewTextMessageFormComponent.details}
          form={{
            radiosId: 'preview-sms',
            errorHeading: '',
            pageHeading: previewTextMessageFormComponent.form.heading,
            action: '',
            state: { formErrors: [], fieldErrors: {} },
            options: previewTextMessageFormComponent.form.options,
            legend: {
              isPgeHeading: false,
              size: 'm',
            },
            buttonText: 'Continue',
          }}
          PreviewComponent={<PreviewTemplate.SMS message={html} />}
        />
      </div>
    </div>
  );
}
