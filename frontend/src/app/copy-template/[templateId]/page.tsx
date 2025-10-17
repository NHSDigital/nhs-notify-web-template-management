'use server';

import { redirect, RedirectType } from 'next/navigation';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { isTemplateDtoValid } from 'nhs-notify-backend-client';

const CopyTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = isTemplateDtoValid(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (validatedTemplate.templateType === 'LETTER') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <CopyTemplate template={validatedTemplate} />;
};

export default CopyTemplatePage;
