'use client';

import { PreviewTemplate } from '@/src/components/molecules/PreviewTemplate';
import { ReviewTemplate } from '@/src/components/organisms/ReviewTemplate';
import { ReviewLetterTemplateProps } from './ReviewLetterTemplate.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function ReviewLetterTemplate({
  templateName,
  heading,
  bodyText,
}: ReviewLetterTemplateProps) {
  const {
    components: { previewLetterFormComponent },
  } = content;

  const html = renderMarkdown(bodyText);

  return (
    <ReviewTemplate
      sectionHeading={previewLetterFormComponent.sectionHeader}
      templateName={templateName}
      details={previewLetterFormComponent.details}
      form={{
        radiosId: 'preview-letter',
        errorHeading: '',
        action: '',
        state: { formErrors: [], fieldErrors: {} },
        pageHeading: previewLetterFormComponent.form.heading,
        options: previewLetterFormComponent.form.options,
        legend: {
          isPgeHeading: false,
          size: 'm',
        },
        buttonText: 'Continue',
      }}
      PreviewComponent={
        <PreviewTemplate.Letter heading={heading} bodyText={html} />
      }
    />
  );
}
