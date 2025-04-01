'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@organisms/PreviewDigitalTemplate';
import content from '@content/content';
import {
  LetterTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { useActionState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { useSearchParams } from 'next/navigation';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { previewLetterTemplateAction } from './server-actions';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';

export function PreviewLetterTemplate({
  initialState,
}: Readonly<PageComponentProps<LetterTemplate>>) {
  const searchParams = useSearchParams();

  const { sectionHeading, form, backLinkText } =
    content.components.previewLetterTemplate;

  const [state, action] = useActionState(
    previewLetterTemplateAction,
    initialState
  );
  const isFromEditPage = searchParams.get('from') === 'edit';

  return (
    <>
      <BackLink href={`${getBasePath()}/manage-templates`} id='back-link'>
        Back to all templates
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state,
                action,
                formId: 'preview-letter-template',
                radiosId: 'previewLetterTemplateAction',
              }}
              previewDetailsComponent={
                <PreviewTemplateDetails.Letter template={initialState} />
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
