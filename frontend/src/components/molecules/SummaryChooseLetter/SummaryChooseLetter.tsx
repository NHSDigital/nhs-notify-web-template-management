import {
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

type SummaryChooseLetterProps = MessagePlanAndTemplatePageProps & {
  validateTemplate: (template?: TemplateDto) => LetterTemplate | undefined;
  redirectUrlOnLockNumberFailure: string;
};

export const SummaryChooseLetter = async (props: SummaryChooseLetterProps) => {
  const { templateId, routingConfigId } = await props.params;
  const { redirectUrlOnLockNumberFailure } = props;

  const searchParams = await props.searchParams;
  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(redirectUrlOnLockNumberFailure, RedirectType.replace);
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

  return (
    <NHSNotifyContainer>
      <PreviewTemplateFromMessagePlan
        initialState={validatedTemplate}
        previewComponent={PreviewTemplateDetailsLetter}
        routingConfigId={routingConfigId}
        lockNumber={lockNumber}
        letterVariant={letterVariant}
      />
    </NHSNotifyContainer>
  );
};
