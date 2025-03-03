'use client';

import { PreviewTemplate } from '@molecules/PreviewTemplate';
import {
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderSMSMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function ViewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderSMSMarkdown(templateMessage);

  const { cannotEdit, createNewTemplate } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`}>
        Back to all templates
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplate.Sms template={initialState} message={html} />
            <p>{cannotEdit}</p>
            <p>{createNewTemplate}</p>
            <p>
              <Link href='/manage-templates'>Back to all templates</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
