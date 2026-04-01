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
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { NHSNotifyContainer } from '@layouts/container/container';

type SummaryPreviewLetterProps = MessagePlanAndTemplatePageProps & {
  validateTemplate: (template?: TemplateDto) => LetterTemplate | undefined;
  hideBackLinks?: boolean;
};

export const SummaryPreviewLetter = async (
  props: SummaryPreviewLetterProps
) => {
  const { templateId, routingConfigId } = await props.params;
  const searchParams = await props.searchParams;
  const { validateTemplate, hideBackLinks } = props;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/edit-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  }

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
        lockNumber={lockNumberResult.data}
        letterVariant={letterVariant}
        hideBackLinks={hideBackLinks}
      />
    </NHSNotifyContainer>
  );
};
