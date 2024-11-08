'use server';

import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { PageProps } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateNhsAppTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  if (!template || template.templateType !== TemplateType.NHS_APP) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <CreateNhsAppTemplate initialState={template} />;
};

export default CreateNhsAppTemplatePage;
