'use client';

import baseContent from '@content/content';
import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  cascadeTemplateTypeToUrlTextMappings,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import { PreviewTemplateComponent } from '@molecules/PreviewTemplateDetails/common';
import { interpolate } from '@utils/interpolate';

export type MessagePlanPreviewTemplateProps<T extends TemplateDto> =
  PageComponentProps<T> & {
    previewComponent: PreviewTemplateComponent<T>;
    routingConfigId: string;
  };

export function PreviewTemplateFromMessagePlan<T extends TemplateDto>({
  initialState: template,
  previewComponent,
  routingConfigId,
}: Readonly<MessagePlanPreviewTemplateProps<T>>) {
  const content = baseContent.components.previewTemplateFromMessagePlan;

  const backLinkHref = interpolate(content.backLink.href, {
    templateType: cascadeTemplateTypeToUrlTextMappings(template.templateType),
    routingConfigId,
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
            })}

            <p>
              <Link href={backLinkHref}>{content.backLink.text}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
}
