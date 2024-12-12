'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import {
  EmailTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { useFormState } from 'react-dom';
import { getBasePath } from '@utils/get-base-path';
import { renderEmailMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { BackLink } from 'nhsuk-react-components';
import { reviewEmailTemplateAction } from './server-actions';

export function ReviewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const searchParams = useSearchParams();

  const {
    components: {
      reviewEmailTemplateContent: { sectionHeading, form },
    },
  } = content;

  const [state, action] = useFormState(reviewEmailTemplateAction, initialState);

  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;
  const html = renderEmailMarkdown(templateMessage);
  const isFromEditPage = searchParams.get('from') === 'edit';

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
          formId: 'review-email-template',
          radiosId: 'reviewEmailTemplateAction',
        }}
        PreviewComponent={
          <PreviewTemplate.Email
            template={initialState}
            subject={templateSubjectLine}
            message={html}
          />
        }
      />
      <p>
        <Link href='/manage-templates'>Back to all templates</Link>
      </p>
    </div>
  );
}
