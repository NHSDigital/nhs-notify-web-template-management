'use client';

import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import {
  EmailTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { renderEmailMarkdown } from '@utils/markdownit';
import { BackLink } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function ViewEmailTemplate({
  initialState,
}: Readonly<PageComponentProps<EmailTemplate>>) {
  const templateSubjectLine = initialState.subject;
  const templateMessage = initialState.message;

  const html = renderEmailMarkdown(templateMessage);

  const { cannotEdit, createNewTemplate, backLinkText } =
    content.components.viewSubmittedTemplate;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <BackLink>{backLinkText}</BackLink>
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetailsEmail
              template={initialState}
              subject={templateSubjectLine}
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
