'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export type ReviewLetterTemplateProps = {
  templateName: string;
  heading: string;
  bodyText: string;
};

export function ReviewLetterTemplate({
  templateName,
  heading,
  bodyText,
}: ReviewLetterTemplateProps) {
  const {
    components: {
      reviewLetterTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  const html = renderMarkdown(bodyText);

  return (
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
        formId: 'review-letter-template',
        radiosId: 'reviewLetterTemplateAction',
      }}
      PreviewComponent={
        <PreviewTemplate.Letter heading={heading} bodyText={html} />
      }
    />
  );
}
