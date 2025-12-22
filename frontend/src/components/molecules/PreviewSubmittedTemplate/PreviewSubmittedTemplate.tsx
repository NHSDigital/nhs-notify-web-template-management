'use client';

import { PageComponentProps } from 'nhs-notify-web-template-management-utils';
import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { TemplateDto } from 'nhs-notify-backend-client';
import { PreviewTemplateComponent } from '@molecules/PreviewTemplateDetails/common';

export type PreviewSubmittedTemplateProps<T extends TemplateDto> =
  PageComponentProps<T> & {
    previewComponent: PreviewTemplateComponent<T>;
  };

export function PreviewSubmittedTemplate<T extends TemplateDto>({
  initialState,
  previewComponent,
}: Readonly<PreviewSubmittedTemplateProps<T>>) {
  const content = baseContent.components.viewSubmittedTemplate;

  return (
    <>
      <Link href={content.backLink.href} passHref legacyBehavior>
        <NotifyBackLink>{content.backLink.text}</NotifyBackLink>
      </Link>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {previewComponent({
              template: initialState,
            })}

            {initialState.templateType !== 'LETTER' && (
              <p>{content.cannotEdit}</p>
            )}
            <p>{content.createNewTemplate}</p>

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
