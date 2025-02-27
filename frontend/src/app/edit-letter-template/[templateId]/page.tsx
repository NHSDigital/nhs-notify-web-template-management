'use server';

import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateLetterTemplate } from '@utils/validate-template';

const CreateLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <LetterTemplateForm initialState={validatedTemplate} />;
};

export default CreateLetterTemplatePage;
