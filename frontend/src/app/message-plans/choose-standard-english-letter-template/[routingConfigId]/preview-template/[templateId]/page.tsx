'use server';

import {
  MessagePlanAndTemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import PreviewTemplateDetailsLetterAdapter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetterAdapter';
import { $LockNumber } from 'nhs-notify-backend-client';

const { pageTitle } = content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewStandardEnglishLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { templateId, routingConfigId } = await props.params;
  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/choose-templates/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (
    !validatedTemplate ||
    validatedTemplate.letterType !== 'x0' ||
    validatedTemplate.language !== 'en'
  ) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <PreviewTemplateFromMessagePlan
      initialState={validatedTemplate}
      previewComponent={PreviewTemplateDetailsLetterAdapter}
      routingConfigId={routingConfigId}
      lockNumber={lockNumberResult.data}
    />
  );
};

export default PreviewStandardEnglishLetterTemplateFromMessagePlan;
