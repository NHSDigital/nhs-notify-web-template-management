'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import Link from 'next/link';

export function ViewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<SubmittedNHSAppTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderNHSAppMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <BackLink href={`${getBasePath()}/manage-templates`}>
          Back to all templates
        </BackLink>
        <PreviewTemplate.NHSApp template={initialState} message={html} />
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
