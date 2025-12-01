'use server';

import { Metadata } from 'next';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import {
  TemplatePageProps,
  validateSubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';

const { pageTitle } = content.components.templateSubmitted;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.SMS,
  };
}

const SmsTemplateSubmittedPage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default SmsTemplateSubmittedPage;
