'use client';

import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import type {
  LetterVariant,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
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
    lockNumber?: number;
    letterVariant?: LetterVariant;
    hideBackLinks?: boolean;
  };

export function PreviewTemplateFromMessagePlan<T extends TemplateDto>({
  initialState: template,
  previewComponent,
  routingConfigId,
  lockNumber,
  letterVariant,
  hideBackLinks,
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

  const backLinkHref =
    hideBackLinks || lockNumber === undefined
      ? undefined
      : interpolate(content.backLink.href, {
          templateType: templateTypeToUrlTextMappings(
            template.templateType,
            letterType
          ),
          routingConfigId,
          lockNumber,
        });

  return (
    <>
      {backLinkHref && (
        <Link href={backLinkHref} passHref legacyBehavior>
          <NotifyBackLink>{content.backLink.text}</NotifyBackLink>
        </Link>
      )}

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {previewComponent({
              template,
              letterVariant,
              hideStatus: true,
              hideEditActions: true,
              hideLearnMore: true,
            })}
            {backLinkHref && (
              <Link
                className='nhsuk-link nhsuk-body-m nhsuk-u-display-inline-block'
                href={backLinkHref}
                data-testid='back-link-bottom'
              >
                {content.backLink.text}
              </Link>
            )}
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
