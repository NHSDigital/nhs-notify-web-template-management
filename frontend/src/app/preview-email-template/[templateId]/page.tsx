'use server';

import { Metadata } from 'next';
import {
  PageProps,
  validateEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewEmailTemplate } from '@forms/PreviewEmailTemplate';
import content from '@content/content';
import { serverIsFeatureEnabled } from '@utils/server-features';

const { pageTitle } = content.components.previewEmailTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewEmailTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  const routingEnabled = await serverIsFeatureEnabled('routing');

  return (
    <PreviewEmailTemplate
      initialState={validatedTemplate}
      routingEnabled={routingEnabled}
    />
  );
};

export default PreviewEmailTemplatePage;
