'use client';

import Link from 'next/link';
import { PreviewTemplate } from '@molecules/PreviewTemplate';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
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
import { reviewNhsAppTemplateAction } from './server-action';

export function ReviewNHSAppTemplate({
  initialState,
}: Readonly<PageComponentProps<NHSAppTemplate>>) {
  const searchParams = useSearchParams();

  const [state, action] = useActionState(
    reviewNhsAppTemplateAction,
    initialState
  );

  const { message } = state;
  const html = renderNHSAppMarkdown(message);
  const isFromEditPage = searchParams.get('from') === 'edit';

  const {
    components: {
      reviewNHSAppTemplate: { sectionHeading, form },
    },
  } = content;

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
                formId: 'preview-nhs-app-template',
                radiosId: 'reviewNHSAppTemplateAction',
              }}
              PreviewComponent={
                <PreviewTemplate.NHSApp
                  template={initialState}
                  message={html}
                />
              }
            />
            <p>
              <Link href='/manage-templates'>Back to all templates</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
