'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { BackLink } from 'nhsuk-react-components';
import Link from 'next/link';
import { renderSMSMarkdown } from '@utils/markdownit';

export function ViewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SubmittedSMSTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderSMSMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <BackLink href={`${getBasePath()}/manage-templates`}>
          Back to all templates
        </BackLink>
        <PreviewTemplate.Sms template={initialState} message={html} />
        <p>This template cannot be edited because it has been submitted.</p>
        <p>
          If you want to change a submitted or live template, you must create a
          new template to replace it.
        </p>
        <p>
          <Link href='/manage-templates'>Back to all templates</Link>
        </p>
      </div>
    </div>
  );
}
