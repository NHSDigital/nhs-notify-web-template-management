'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SubmittedEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderEmailMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import { viewSubmittedTemplatePageContent as content } from '@content/content';
import Link from 'next/link';

export function ViewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<SubmittedEmailTemplate>>) {
  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;

  const html = renderEmailMarkdown(templateMessage);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <BackLink href={`${getBasePath()}/manage-templates`}>
          Back to all templates
        </BackLink>
        <PreviewTemplate.Email
          template={initialState}
          subject={templateSubjectLine}
          message={html}
        />
        <p>{content.cannotEdit}</p>
        <p>{content.createNewTemplate}</p>
        <p>
          <Link href='/manage-templates'>Back to all templates</Link>
        </p>
      </div>
    </div>
  );
}
