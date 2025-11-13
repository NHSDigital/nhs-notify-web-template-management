'use server';

import {
  MessagePlanAndTemplatePageProps,
  validateSubmittedLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';

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

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <PreviewTemplateFromMessagePlan
      initialState={validatedTemplate}
      previewComponent={PreviewTemplateDetailsLetter}
      routingConfigId={routingConfigId}
    />
  );
};

export default PreviewStandardEnglishLetterTemplateFromMessagePlan;
