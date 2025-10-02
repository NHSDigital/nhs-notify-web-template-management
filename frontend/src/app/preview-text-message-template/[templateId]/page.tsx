'use server';

import { Metadata } from 'next';
import {
  TemplatePageProps,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewSMSTemplate } from '@forms/PreviewSMSTemplate';
import content from '@content/content';
import { serverIsFeatureEnabled } from '@utils/server-features';

const { pageTitle } = content.components.previewSMSTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSMSTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const routingEnabled = await serverIsFeatureEnabled('routing');

  return (
    <PreviewSMSTemplate
      initialState={validatedTemplate}
      routingEnabled={routingEnabled}
    />
  );
};

export default PreviewSMSTemplatePage;
