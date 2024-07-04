'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { PageComponentProps } from '@utils/types';
import content from '@/src/content/content';
import { renderMarkdown } from './server-actions';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';

export function ReviewNHSAppTemplate({ state, action }: PageComponentProps) {
  const { nhsAppTemplateName, nhsAppTemplateMessage } = state;

  const html = renderMarkdown(nhsAppTemplateMessage);

  const {
    components: { previewNHSAppFormComponent },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton
        formId='review-nhs-app-template-back'
        action={action}
      ></NHSNotifyBackButton>
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          templateName={nhsAppTemplateName}
          sectionHeading={previewNHSAppFormComponent.sectionHeading}
          details={previewNHSAppFormComponent.details}
          form={{
            ...previewNHSAppFormComponent.form,
            state,
            action,
            formId: 'review-nhs-app-template',
            radiosId: 'reviewNHSAppTemplateAction',
            legend: {
              isPgeHeading: false,
              size: 'm',
            },
          }}
          PreviewComponent={<PreviewTemplate.NHSApp message={html} />}
        />
      </div>
    </div>
  );
}
