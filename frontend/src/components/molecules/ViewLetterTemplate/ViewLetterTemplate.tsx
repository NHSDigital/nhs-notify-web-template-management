'use client';

import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
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
  user,
}: Readonly<PageComponentProps<LetterTemplate> & { user?: string }>) {
  const { createNewTemplate, backLinkText } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <BackLink
        href={`${getBasePath()}/message-templates`}
        data-testid='back-to-templates-link'
      >
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetailsLetter template={initialState} user={user} />
            <p>{createNewTemplate}</p>
            <p>
              <Link
                href='/message-templates'
                data-testid='back-to-templates-link-bottom'
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
