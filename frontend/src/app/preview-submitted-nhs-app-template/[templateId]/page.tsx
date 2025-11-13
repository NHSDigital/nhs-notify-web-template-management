'use server';

import {
  TemplatePageProps,
  validateSubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';

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

  return (
    <PreviewSubmittedTemplate
      initialState={validatedTemplate}
      previewComponent={PreviewTemplateDetailsNhsApp}
    />
  );
};

export default PreviewSubmittedNHSAppTemplatePage;
