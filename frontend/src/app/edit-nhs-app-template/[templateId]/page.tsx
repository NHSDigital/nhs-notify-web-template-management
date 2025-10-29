'use server';

import { Metadata } from 'next';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import {
  TemplatePageProps,
  validateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';

const { editPageTitle } = content.components.templateFormNhsApp;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: editPageTitle,
  };
}

const CreateNhsAppTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <NhsAppTemplateForm initialState={validatedTemplate} />;
};

export default CreateNhsAppTemplatePage;
