'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import {
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { reviewNhsAppTemplateAction } from './server-action';

export function ReviewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const searchParams = useSearchParams();

  const [state, action] = useFormState(
    reviewNhsAppTemplateAction,
    initialState
  );

  const { message } = state;
  const html = renderNHSAppMarkdown(message);
  const isFromEditPage = searchParams.get('from') === 'edit';

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
        sectionHeading={isFromEditPage ? sectionHeading : undefined}
        form={{
          ...form,
          state,
          action,
          formId: 'preview-nhs-app-template',
          radiosId: 'reviewNHSAppTemplateAction',
        }}
        PreviewComponent={
          <PreviewTemplate.NHSApp template={initialState} message={html} />
        }
      />
      <p>
        <Link href='/manage-templates'>Back to all templates</Link>
      </p>
    </div>
  );
}
