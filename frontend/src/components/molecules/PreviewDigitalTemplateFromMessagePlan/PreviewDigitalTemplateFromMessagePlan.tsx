'use client';

import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import {
  templateTypeToUrlTextMappings,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { PreviewTemplateComponent } from '@molecules/PreviewTemplateDetails/common';
import { interpolate } from '@utils/interpolate';

export type DigitalTemplatePreviewProps<T extends TemplateDto> =
  PageComponentProps<T> & {
    previewComponent: PreviewTemplateComponent<T>;
    routingConfigId: string;
    lockNumber: number;
  };

export function PreviewDigitalTemplateFromMessagePlan<T extends TemplateDto>({
  initialState: template,
  previewComponent,
  routingConfigId,
  lockNumber,
}: Readonly<DigitalTemplatePreviewProps<T>>) {
  const content = baseContent.components.previewTemplateFromMessagePlan;

  const backLinkHref = interpolate(content.backLink.href, {
    templateType: templateTypeToUrlTextMappings(template.templateType),
    routingConfigId,
    lockNumber,
  });

  return (
    <>
      <NHSNotifyBackLink href={backLinkHref}>
        {content.backLink.text}
      </NHSNotifyBackLink>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            {previewComponent({
              template,
              hideStatus: true,
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
