'use client';

import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import {
  templateTypeToUrlTextMappings,
  PageComponentProps,
  RoutingSupportedLetterType,
} from 'nhs-notify-web-template-management-utils';
import { PreviewTemplateComponent } from '@molecules/PreviewTemplateDetails/common';
import { interpolate } from '@utils/interpolate';

export type MessagePlanPreviewTemplateProps<T extends TemplateDto> =
  PageComponentProps<T> & {
    previewComponent: PreviewTemplateComponent<T>;
    routingConfigId: string;
    lockNumber: number;
  };

export function PreviewTemplateFromMessagePlan<T extends TemplateDto>({
  initialState: template,
  previewComponent,
  routingConfigId,
  lockNumber,
}: Readonly<MessagePlanPreviewTemplateProps<T>>) {
  const content = baseContent.components.previewTemplateFromMessagePlan;

  let letterType: RoutingSupportedLetterType | undefined;
  if (template.templateType === 'LETTER' && 'letterType' in template) {
    const isForeignLanguage =
      'language' in template && template.language && template.language !== 'en';
    letterType = isForeignLanguage
      ? 'language'
      : (template.letterType as RoutingSupportedLetterType);
  }

  const backLinkHref = interpolate(content.backLink.href, {
    templateType: templateTypeToUrlTextMappings(
      template.templateType,
      letterType
    ),
    routingConfigId,
    lockNumber,
  });

  return (
    <>
      <Link href={backLinkHref} passHref legacyBehavior>
        <NotifyBackLink>{content.backLink.text}</NotifyBackLink>
      </Link>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {previewComponent({
              template,
              hideStatus: true,
              hideEditActions: true,
            })}
            <Link
              className='nhsuk-link nhsuk-body-m nhsuk-u-display-inline-block'
              href={backLinkHref}
              data-testid='back-link-bottom'
            >
              {content.backLink.text}
            </Link>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
