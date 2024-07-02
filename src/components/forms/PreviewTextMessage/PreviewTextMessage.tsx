'use client';

import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewTextMessageProps } from './PreviewTextMessage.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function PreviewTextMessage({
  templateName,
  message,
}: PreviewTextMessageProps) {
  const {
    components: { previewTextMessageFormComponent },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
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
          PreviewComponent={<Preview.TextMessage message={html} />}
        />
      </div>
    </div>
  );
}
