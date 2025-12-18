'use server';

import {
  MessagePlanAndTemplatePageProps,
  validateEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';

const { pageTitle } = content.components.previewEmailTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewEmailTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { templateId, routingConfigId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <PreviewTemplateFromMessagePlan
      initialState={validatedTemplate}
      previewComponent={PreviewTemplateDetailsEmail}
      routingConfigId={routingConfigId}
    />
  );
};

export default PreviewEmailTemplateFromMessagePlan;
