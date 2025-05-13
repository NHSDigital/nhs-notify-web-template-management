'use client';

import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import {
  LetterTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { BackLink } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function ViewLetterTemplate({
  initialState,
}: Readonly<PageComponentProps<LetterTemplate>>) {
  const { createNewTemplate, backLinkText } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <BackLink
        data-testid='back-to-templates-link'
        href={`${getBasePath()}/message-templates`}
      >
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetails.Letter template={initialState} />
            <p>{createNewTemplate}</p>
            <p>
              <Link
                data-testid='back-to-templates-link-bottom'
                href='/message-templates'
              >
                {backLinkText}
              </Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
