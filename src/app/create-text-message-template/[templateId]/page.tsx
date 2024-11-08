'use server';

import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';
import { PageProps } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateSmsTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  if (!template || template.templateType !== TemplateType.SMS) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <CreateSmsTemplate initialState={template} />;
};

export default CreateSmsTemplatePage;
