import {
  MessagePlanAndTemplatePageProps,
  templateTypeToUrlTextMappings,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import Link from 'next/link';
import baseContent from '@content/content';
import { interpolate } from '@utils/interpolate';
import { ComponentType } from 'react';

type PreviewDigitalTemplateFromChooseTemplateProps<T extends TemplateDto> =
  MessagePlanAndTemplatePageProps & {
    validateTemplate: (template?: TemplateDto) => T | undefined;
    DetailComponent: ComponentType<{ template: T; hideStatus?: boolean }>;
  };

export async function PreviewDigitalTemplateFromChooseTemplate<T extends TemplateDto>(
  props: PreviewDigitalTemplateFromChooseTemplateProps<T>
) {
  const { templateId, routingConfigId } = await props.params;

  const searchParams = await props.searchParams;
  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const lockNumber = lockNumberResult.data;

  const template = await getTemplate(templateId);

  const validatedTemplate = props.validateTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const content = baseContent.components.previewTemplateFromMessagePlan;

  const backLinkHref = interpolate(content.backLink.href, {
    templateType: templateTypeToUrlTextMappings(validatedTemplate.templateType),
    routingConfigId,
    lockNumber,
  });

  const { DetailComponent } = props;

  return (
    <NHSNotifyContainer>
      <NHSNotifyBackLink href={backLinkHref}>
        {content.backLink.text}
      </NHSNotifyBackLink>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <DetailComponent template={validatedTemplate} hideStatus />
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
    </NHSNotifyContainer>
  );
}
