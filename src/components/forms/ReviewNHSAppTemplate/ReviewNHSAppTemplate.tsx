'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { NHSAppTemplate, PageComponentProps } from '@utils/types';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { reviewNhsAppTemplateAction, renderMarkdown } from './server-action';

export function ReviewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const [state, action] = useFormState(
    reviewNhsAppTemplateAction,
    initialState
  );

  const { message } = state;

  const html = renderMarkdown(message);

  const {
    components: {
      reviewNHSAppTemplateContent: { sectionHeading, form },
    },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <BackLink
        href={`${getBasePath()}/manage-templates`}
        className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-left-3'
      >
        Back to all templates
      </BackLink>
      <ReviewTemplate
        template={initialState}
        sectionHeading={sectionHeading}
        form={{
          ...form,
          state,
          action,
          formId: 'preview-nhs-app-template',
          radiosId: 'reviewNHSAppTemplateAction',
        }}
        PreviewComponent={<PreviewTemplate.NHSApp message={html} />}
      />
      <p>
        <a href={`${getBasePath()}/manage-templates`}>Back to all templates</a>
      </p>
    </div>
  );
}
