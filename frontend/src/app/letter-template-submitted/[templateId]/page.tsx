'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import {
  TemplatePageProps,
  validateSubmittedLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';
import { Metadata } from 'next';

const { pageTitle } = content.components.templateSubmitted;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle.LETTER,
  };
}

const LetterTemplateSubmittedPage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default LetterTemplateSubmittedPage;
