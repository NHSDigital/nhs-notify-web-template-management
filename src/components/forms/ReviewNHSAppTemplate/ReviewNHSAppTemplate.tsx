'use client';

import { useRouter } from 'next/navigation';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { PageComponentProps } from '@utils/types';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { reviewNhsAppTemplateAction, renderMarkdown } from './server-action';

export function ReviewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps>) {
  const [state, action] = useFormState(
    reviewNhsAppTemplateAction,
    initialState
  );
  const router = useRouter();

  if (state.redirect) {
    router.push(state.redirect);
  }

  const { nhsAppTemplateName, nhsAppTemplateMessage } = state;

  const html = renderMarkdown(nhsAppTemplateMessage);

  const {
    components: {
      reviewNHSAppTemplateContent: { sectionHeading, details, form },
    },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <BackLink
        href={`${getBasePath()}/create-nhs-app-template/${initialState.id}`}
        className='nhsuk-u-margin-bottom-7 nhsuk-u-margin-left-3'
      >
        Go back
      </BackLink>
      <div className='nhsuk-grid-column-two-thirds'>
        <ReviewTemplate
          templateName={nhsAppTemplateName}
          sectionHeading={sectionHeading}
          details={details}
          form={{
            ...form,
            state,
            action,
            formId: 'preview-nhs-app-template',
            radiosId: 'reviewNHSAppTemplateAction',
          }}
          PreviewComponent={<PreviewTemplate.NHSApp message={html} />}
        />
      </div>
    </div>
  );
}
