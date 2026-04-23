'use client';

import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { useFeatureFlags } from '@providers/client-config-provider';
import { ComponentType } from 'react';

export type PreviewSubmittedDigitalTemplateProps<T extends TemplateDto> = {
  template: T;
  detailsComponent: ComponentType<{ template: T; hideStatus?: boolean }>;
};

export function PreviewSubmittedDigitalTemplate<T extends TemplateDto>({
  template,
  detailsComponent: DetailComponent,
}: Readonly<PreviewSubmittedDigitalTemplateProps<T>>) {
  const content = baseContent.components.viewSubmittedTemplate;

  const { routing } = useFeatureFlags();

  return (
    <>
      <Link href={content.backLink.href} passHref legacyBehavior>
        <NotifyBackLink>{content.backLink.text}</NotifyBackLink>
      </Link>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <DetailComponent template={template} />

            {!routing && (
              <>
                <p>{content.cannotEdit}</p>
                <p>{content.createNewTemplate}</p>
              </>
            )}

            <p>
              <Link href={content.backLink.href} data-testid='back-link-bottom'>
                {content.backLink.text}
              </Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
