'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { getTemplate } from '@utils/form-actions';
import { PageProps } from '@utils/types';
import { redirect, RedirectType } from 'next/navigation';

const ChooseATemplateTypePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  if (!template) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ChooseTemplate initialState={template} />;
};

export default ChooseATemplateTypePage;
