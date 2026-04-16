import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { NHSNotifyContainer } from '@layouts/container/container';

export const PreviewLetterFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { templateId, routingConfigId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateAuthoringLetterTemplate(template);

  if (!validatedTemplate || !validatedTemplate.letterVariantId) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  return (
    <NHSNotifyContainer>
      <PreviewTemplateFromMessagePlan
        initialState={validatedTemplate}
        previewComponent={PreviewTemplateDetailsLetter}
        routingConfigId={routingConfigId}
        letterVariant={letterVariant}
        hideBackLinks
      />
    </NHSNotifyContainer>
  );
};
