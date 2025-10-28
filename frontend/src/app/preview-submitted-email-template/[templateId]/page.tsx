'use server';

import {
  TemplatePageProps,
  validateSubmittedEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';
import { Metadata } from 'next';
import content from '@content/content';

const { pageTitle } = content.components.previewEmailTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedEmailTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedEmailTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewEmailTemplate initialState={validatedTemplate} />;
};

export default PreviewSubmittedEmailTemplatePage;
