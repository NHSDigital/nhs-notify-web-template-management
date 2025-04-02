'use client';

import Link from 'next/link';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import {
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { previewNhsAppTemplateAction } from './server-action';

export function PreviewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const searchParams = useSearchParams();

  const [state, action] = useActionState(
    previewNhsAppTemplateAction,
    initialState
  );

  const { message } = state;
  const html = renderNHSAppMarkdown(message);
  const isFromEditPage = searchParams.get('from') === 'edit';

  const { sectionHeading, form, backLinkText } =
    content.components.previewNHSAppTemplate;

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`} id='back-link'>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewDigitalTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state,
                action,
                formId: 'preview-nhs-app-template',
                radiosId: 'previewNHSAppTemplateAction',
              }}
              previewDetailsComponent={
                <PreviewTemplateDetails.NHSApp
                  template={initialState}
                  message={html}
                />
              }
            />
            <p>
              <Link href='/manage-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
