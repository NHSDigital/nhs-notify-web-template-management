'use server';

import {
  TemplatePageProps,
  validateSubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';
import { Metadata } from 'next';
import content from '@content/content';

const { pageTitle } = content.components.previewNHSAppTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewSubmittedNHSAppTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedNHSAppTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewNHSAppTemplate initialState={validatedTemplate} />;
};

export default PreviewSubmittedNHSAppTemplatePage;
