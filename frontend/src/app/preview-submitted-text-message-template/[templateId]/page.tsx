'use server';

import {
  TemplatePageProps,
  validateSubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import { Metadata } from 'next';
import content from '@content/content';

const { pageTitle } = content.components.previewSMSTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedSMSTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedSMSTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewSMSTemplate initialState={validatedTemplate} />;
};

export default PreviewSubmittedSMSTemplatePage;
