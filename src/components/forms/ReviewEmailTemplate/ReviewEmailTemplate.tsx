'use client';

import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { ReviewEmailTemplateProps } from './ReviewEmailTemplate.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function ReviewEmailTemplate({
  templateName,
  subject,
  message,
}: ReviewEmailTemplateProps) {
  const {
    components: { previewEmailFormComponent },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          sectionHeading={previewEmailFormComponent.sectionHeader}
          templateName={templateName}
          details={previewEmailFormComponent.details}
          form={{
            radiosId: 'preview-email',
            errorHeading: '',
            action: '',
            state: { formErrors: [], fieldErrors: {} },
            pageHeading: previewEmailFormComponent.form.heading,
            options: previewEmailFormComponent.form.options,
            legend: {
              isPgeHeading: false,
              size: 'm',
            },
            buttonText: 'Continue',
          }}
          PreviewComponent={<Preview.Email subject={subject} value={html} />}
        />
      </div>
    </div>
  );
}
