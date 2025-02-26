'use client';

import Link from 'next/link';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
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
import { reviewLetterTemplateAction } from './server-actions';
import { PreviewTemplate } from '@molecules/PreviewTemplate';

export function ReviewLetterTemplate({
  initialState,
}: Readonly<PageComponentProps<LetterTemplate>>) {
  const searchParams = useSearchParams();

  const { sectionHeading, form, backLinkText } =
    content.components.reviewLetterTemplate;

  const [state, action] = useActionState(
    reviewLetterTemplateAction,
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
            <ReviewTemplate
              template={initialState}
              sectionHeading={isFromEditPage ? sectionHeading : undefined}
              form={{
                ...form,
                state,
                action,
                formId: 'review-letter-template',
                radiosId: 'reviewLetterTemplateAction',
              }}
              PreviewComponent={
                <PreviewTemplate.Letter template={initialState} />
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
