'use client';

import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import {
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { renderSMSMarkdown } from '@utils/markdownit';
import content from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export function ViewSMSTemplate({
  initialState,
}: Readonly<PageComponentProps<SMSTemplate>>) {
  const templateMessage = initialState.message;

  const html = renderSMSMarkdown(templateMessage);

  const { cannotEdit, createNewTemplate, backLinkText } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <NotifyBackLink>{backLinkText}</NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetailsSms template={initialState} message={html} />
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
