'use server';

import { redirect, RedirectType } from 'next/navigation';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import { PageProps, $Template } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { zodValidate } from '@utils/validate-template';
import { getCsrfFormValue } from '@utils/csrf-utils';

const CopyTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($Template, template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return <CopyTemplate template={validatedTemplate} csrfToken={csrfToken} />;
};

export default CopyTemplatePage;
