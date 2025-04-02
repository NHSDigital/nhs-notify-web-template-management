'use server';

import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewLetterTemplate } from '@organisms/PreviewLetterTemplate/PreviewLetterTemplate';

const PreviewLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <PreviewLetterTemplate template={validatedTemplate} />;
};

export default PreviewLetterTemplatePage;
