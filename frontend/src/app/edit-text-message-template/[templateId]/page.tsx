'use server';

import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import {
  PageProps,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';

const { editPageTitle } = content.components.templateFormSms;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: editPageTitle,
  };
}

const CreateSmsTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <SmsTemplateForm initialState={validatedTemplate} />;
};

export default CreateSmsTemplatePage;
