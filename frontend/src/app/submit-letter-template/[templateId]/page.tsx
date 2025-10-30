'use server';

import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Submit letter template',
  };
}

const SubmitLetterTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitLetterTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      lockNumber={validatedTemplate.lockNumber}
    />
  );
};

export default SubmitLetterTemplatePage;
