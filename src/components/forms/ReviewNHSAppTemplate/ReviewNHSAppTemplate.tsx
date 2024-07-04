'use client';

import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { ReviewNHSAppTemplateProps } from './ReviewNHSAppTemplate.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function ReviewNHSAppTemplate({
  templateName,
  message,
}: ReviewNHSAppTemplateProps) {
  const html = renderMarkdown(message);

  const {
    components: { previewNHSAppFormComponent },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          sectionHeading={previewNHSAppFormComponent.sectionHeader}
          templateName={templateName}
          details={previewNHSAppFormComponent.details}
          form={{
            radiosId: 'preview-nhs-app',
            errorHeading: '',
            action: '',
            state: { formErrors: [], fieldErrors: {} },
            pageHeading: previewNHSAppFormComponent.form.heading,
            options: previewNHSAppFormComponent.form.options,
            legend: {
              isPgeHeading: false,
              size: 'm',
            },
            buttonText: 'Continue',
          }}
          PreviewComponent={<Preview.NHSApp message={html} />}
        />
      </div>
    </div>
  );
}
