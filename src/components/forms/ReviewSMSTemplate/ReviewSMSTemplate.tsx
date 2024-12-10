'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import content from '@content/content';
import { PageComponentProps, SMSTemplate } from '@utils/types';
import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { renderMarkdown, reviewSmsTemplateAction } from './server-actions';

export function ReviewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const {
    components: {
      reviewSMSTemplateContent: { sectionHeading, form },
    },
  } = content;

  const [state, action] = useFormState(reviewSmsTemplateAction, initialState);

  const templateMessage = initialState.message;

  const html = renderMarkdown(templateMessage);

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
          formId: 'review-sms-template',
          radiosId: 'reviewSMSTemplateAction',
        }}
        PreviewComponent={<PreviewTemplate.Sms message={html} />}
      />
      <p>
        <Link href='/manage-templates'>Back to all templates</Link>
      </p>
    </div>
  );
}
