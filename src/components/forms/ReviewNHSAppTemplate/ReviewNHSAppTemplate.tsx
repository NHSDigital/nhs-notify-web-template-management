'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { PageComponentProps } from '@utils/types';
import content from '@/src/content/content';
import { renderMarkdown } from './server-actions';

export function ReviewNHSAppTemplate({
  state,
  action,
}: Readonly<PageComponentProps>) {
  const { nhsAppTemplateName, nhsAppTemplateMessage } = state;

  const html = renderMarkdown(nhsAppTemplateMessage);

  const {
    components: {
      reviewNHSAppTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton
        formId='review-nhs-app-template-back'
        action={action}
      />
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          templateName={nhsAppTemplateName}
          sectionHeading={sectionHeading}
          details={details}
          form={{
            ...form,
            state,
            action,
            formId: 'review-nhs-app-template',
            radiosId: 'reviewNHSAppTemplateAction',
          }}
          PreviewComponent={<PreviewTemplate.NHSApp message={html} />}
        />
      </div>
    </div>
  );
}
