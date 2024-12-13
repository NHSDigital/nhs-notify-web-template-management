'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderSMSMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import { viewSubmittedTemplatePageContent as content } from '@content/content';
import Link from 'next/link';

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
        <p>{content.cannotEdit}</p>
        <p>{content.createNewTemplate}</p>
        <p>
          <Link href='/manage-templates'>Back to all templates</Link>
        </p>
      </div>
    </div>
  );
}
