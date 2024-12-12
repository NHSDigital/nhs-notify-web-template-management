'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import {
  ChannelTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
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

  const template: ChannelTemplate = {
    templateType: TemplateType.LETTER,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    version: 1,
    id: 'id',
    name: 'name',
    message: 'message',
  };

  return (
    <ReviewTemplate
      template={template}
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
        <PreviewTemplate.Letter
          template={template}
          heading={heading}
          bodyText={html}
        />
      }
    />
  );
}
