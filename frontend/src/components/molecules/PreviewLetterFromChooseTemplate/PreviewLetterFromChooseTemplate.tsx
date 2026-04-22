import {
  LetterTemplate,
  MessagePlanAndTemplatePageProps,
  templateTypeToUrlTextMappings,
  getFrontendLetterTypeForUrl,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import Link from 'next/link';
import content from '@content/content';
import { interpolate } from '@utils/interpolate';
import { getRenderDetails } from '@utils/letter-render';

type PreviewLetterFromChooseTemplateProps = MessagePlanAndTemplatePageProps & {
  validateTemplate: (template?: TemplateDto) => LetterTemplate | undefined;
};

const { previewTemplateFromMessagePlan, letterRender } = content.components;

export const PreviewLetterFromChooseTemplate = async (
  props: PreviewLetterFromChooseTemplateProps
) => {
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

  if (
    !validatedTemplate ||
    !('letterVariantId' in validatedTemplate) ||
    !validatedTemplate.letterVariantId
  ) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  const backLinkHref = interpolate(
    previewTemplateFromMessagePlan.backLink.href,
    {
      templateType: templateTypeToUrlTextMappings(
        validatedTemplate.templateType,
        getFrontendLetterTypeForUrl(validatedTemplate)
      ),
      routingConfigId,
      lockNumber,
    }
  );

  const { src: pdfUrl } = getRenderDetails(validatedTemplate, 'initialRender');

  return (
    <NHSNotifyContainer>
      <NHSNotifyBackLink href={backLinkHref}>
        {previewTemplateFromMessagePlan.backLink.text}
      </NHSNotifyBackLink>

      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetailsAuthoringLetter
              template={validatedTemplate}
              letterVariant={letterVariant}
              hideStatus
              hideEditActions
              hideLearnMore
            />
            <h2 className='nhsuk-heading-m'>
              {letterRender.examplePreviewHeading}
            </h2>
            <LetterRenderIframe
              src={pdfUrl}
              title={letterRender.iframe.nonpersonalised.title}
              aria-label={letterRender.iframe.nonpersonalised.ariaLabel}
              className='letter-render-iframe nhsuk-u-margin-bottom-6'
            />
            <Link
              className='nhsuk-link nhsuk-body-m nhsuk-u-display-inline-block'
              href={backLinkHref}
              data-testid='back-link-bottom'
            >
              {previewTemplateFromMessagePlan.backLink.text}
            </Link>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};
