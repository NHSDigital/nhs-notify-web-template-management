'use server';

import { redirect, RedirectType } from 'next/navigation';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import { PageProps, $Template } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { zodValidate } from '@utils/validate-template';

const CopyTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($Template, template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (validatedTemplate.templateType === 'LETTER') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <CopyTemplate template={validatedTemplate} />;
};

export default CopyTemplatePage;
