'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import { TemplateStatus, TemplateType } from '@utils/enum';
import { renderMarkdown } from './server-actions';

export type ReviewLetterTemplateProps = {
  templateName: string;
  heading: string;
  bodyText: string;
};

export function ReviewLetterTemplate({
  heading,
  bodyText,
}: Readonly<ReviewLetterTemplateProps>) {
  const {
    components: {
      reviewLetterTemplateContent: { sectionHeading, form },
    },
  } = content;

  const html = renderMarkdown(bodyText);

  return (
    <ReviewTemplate
      template={{
        templateType: TemplateType.LETTER,
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        version: 1,
        id: 'id',
        name: 'name',
        message: 'message',
      }}
      sectionHeading={sectionHeading}
      form={{
        ...form,
        action: '',
        state: {
          validationError: undefined,
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
