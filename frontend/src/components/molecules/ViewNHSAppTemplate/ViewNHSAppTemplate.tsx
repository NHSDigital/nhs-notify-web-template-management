'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import { viewSubmittedTemplatePageContent as content } from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function ViewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<SubmittedNHSAppTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderNHSAppMarkdown(templateMessage);

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`}>
        Back to all templates
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplate.NHSApp template={initialState} message={html} />
            <p>{content.cannotEdit}</p>
            <p>{content.createNewTemplate}</p>
            <p>
              <Link href='/manage-templates'>Back to all templates</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
