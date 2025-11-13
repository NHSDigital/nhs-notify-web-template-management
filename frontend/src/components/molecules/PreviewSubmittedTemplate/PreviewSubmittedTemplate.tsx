'use client';

import { JSX } from 'react';
import { PageComponentProps } from 'nhs-notify-web-template-management-utils';
import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { useSearchParams } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';

export type PreviewSubmittedTemplateProps<T extends TemplateDto> =
  PageComponentProps<T> & {
    previewElement: ({
      template,
      excludeStatus,
    }: {
      template: T;
      excludeStatus?: boolean;
    }) => JSX.Element;
  };

export function PreviewSubmittedTemplate<T extends TemplateDto>({
  initialState,
  previewElement,
}: Readonly<PreviewSubmittedTemplateProps<T>>) {
  const content = baseContent.components.viewSubmittedTemplate;

  const searchParams = useSearchParams();
  const sourcePage = searchParams.get('sourcePage');
  const fromMessagePlans = sourcePage?.startsWith('/message-plans');

  const backLinkHref = sourcePage || content.allTemplatesBackLinkHref;
  const backLinkText = sourcePage
    ? content.genericBackLinkText
    : content.allTemplatesBackLinkText;

  return (
    <>
      <Link href={backLinkHref} passHref legacyBehavior>
        <NotifyBackLink>{backLinkText}</NotifyBackLink>
      </Link>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {previewElement({
              template: initialState,
              excludeStatus: fromMessagePlans,
            })}

            {!fromMessagePlans && (
              <>
                {initialState.templateType !== 'LETTER' && (
                  <p>{content.cannotEdit}</p>
                )}
                <p>{content.createNewTemplate}</p>
              </>
            )}

            <p>
              <Link href={backLinkHref}>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
