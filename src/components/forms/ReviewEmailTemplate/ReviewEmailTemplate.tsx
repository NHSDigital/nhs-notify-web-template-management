'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import { EmailTemplate, PageComponentProps } from '@utils/types';
import { useFormState } from 'react-dom';
import { getBasePath } from '@utils/get-base-path';
import { BackLink } from 'nhsuk-react-components';
import { renderMarkdown, reviewEmailTemplateAction } from './server-actions';

export function ReviewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const {
    components: {
      reviewEmailTemplateContent: { sectionHeading, form },
    },
  } = content;

  const [state, action] = useFormState(reviewEmailTemplateAction, initialState);

  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;

  const html = renderMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <BackLink
        href={`${getBasePath()}/edit-email-template/${initialState.id}`}
        className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-left-3'
      >
        Go back
      </BackLink>
      <ReviewTemplate
        template={initialState}
        sectionHeading={sectionHeading}
        form={{
          ...form,
          state,
          action,
          formId: 'review-email-template',
          radiosId: 'reviewEmailTemplateAction',
        }}
        PreviewComponent={
          <PreviewTemplate.Email subject={templateSubjectLine} message={html} />
        }
      />
    </div>
  );
}
