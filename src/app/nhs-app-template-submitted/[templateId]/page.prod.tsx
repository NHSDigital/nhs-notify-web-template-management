'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const PreviewNhsAppTemplatePage = async ({
  params: { templateId },
}: TemplateSubmittedPageProps) => {
  const template = await getTemplate(templateId);
  if (!template) {
    redirect('/invalid-template', RedirectType.replace);
  }

  const { name, id } = template;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default PreviewNhsAppTemplatePage;
