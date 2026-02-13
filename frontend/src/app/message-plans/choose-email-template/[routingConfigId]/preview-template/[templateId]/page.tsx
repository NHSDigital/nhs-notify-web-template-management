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
import { NHSNotifyContainer } from '@layouts/container/container';
import { $LockNumber } from 'nhs-notify-backend-client';

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
  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(
      `/message-plans/choose-templates/${routingConfigId}`,
      RedirectType.replace
    );
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <PreviewTemplateFromMessagePlan
        initialState={validatedTemplate}
        previewComponent={PreviewTemplateDetailsEmail}
        routingConfigId={routingConfigId}
        lockNumber={lockNumberResult.data}
      />
    </NHSNotifyContainer>
  );
};

export default PreviewEmailTemplateFromMessagePlan;
