import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { getRenderDetails } from '@utils/letter-render';

const { letterRenderIframe } = content.components;

export const PreviewLetterFromMessagePlanPreview = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateAuthoringLetterTemplate(template);

  if (!validatedTemplate || !validatedTemplate.letterVariantId) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  const { src: pdfUrl } = getRenderDetails(validatedTemplate, 'initialRender');

  return (
    <NHSNotifyContainer>
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
              {content.components.letterRender.examplePreviewHeading}
            </h2>
            <LetterRenderIframe
              src={pdfUrl}
              title={letterRenderIframe.nonpersonalised.title}
              aria-label={letterRenderIframe.nonpersonalised.ariaLabel}
              className='letter-render-iframe nhsuk-u-margin-bottom-6'
            />
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};
