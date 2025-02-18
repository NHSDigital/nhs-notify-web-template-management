'use server';

import { redirect, RedirectType } from 'next/navigation';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import {
  PageProps,
  $Template,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { zodValidate } from '@utils/validate-template';

const CopyTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($Template, template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const templateTypes = Object.values(TemplateType).filter(
    (t) => process.env.ENABLE_LETTERS || t !== TemplateType.LETTER
  );

  return (
    <CopyTemplate template={validatedTemplate} templateTypes={templateTypes} />
  );
};

export default CopyTemplatePage;
