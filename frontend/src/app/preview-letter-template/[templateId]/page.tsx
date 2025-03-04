'use server';

import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateLetterTemplate } from '@utils/validate-template';
import { PreviewLetterTemplate } from '@forms/PreviewLetterTemplate/PreviewLetterTemplate';

const PreviewLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <PreviewLetterTemplate initialState={validatedTemplate} />;
};

export default PreviewLetterTemplatePage;
