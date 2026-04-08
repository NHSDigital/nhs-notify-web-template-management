import {
  AuthoringLetterTemplate,
  LetterTemplate,
  MessagePlanAndTemplatePageProps,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { NHSNotifyContainer } from '@layouts/container/container';

type SummaryLetterFromMessagePlanProps = MessagePlanAndTemplatePageProps & {
  validateTemplate: (template?: TemplateDto) => LetterTemplate | undefined;
};

export const SummaryLetterFromMessagePlan = async (
  props: SummaryLetterFromMessagePlanProps
) => {
  const { templateId, routingConfigId } = await props.params;
  const { validateTemplate } = props;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariantId = (validatedTemplate as AuthoringLetterTemplate)
    .letterVariantId;

  const letterVariant = letterVariantId
    ? await getLetterVariantById(letterVariantId)
    : undefined;

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
