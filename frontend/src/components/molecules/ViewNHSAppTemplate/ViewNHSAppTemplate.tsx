'use client';

import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import {
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function ViewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderNHSAppMarkdown(templateMessage);

  const { cannotEdit, createNewTemplate, backLinkText } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <BackLink href={`${getBasePath()}/message-templates`}>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetails.NHSApp
              template={initialState}
              message={html}
            />
            <p>{cannotEdit}</p>
            <p>{createNewTemplate}</p>
            <p>
              <Link href='/message-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
