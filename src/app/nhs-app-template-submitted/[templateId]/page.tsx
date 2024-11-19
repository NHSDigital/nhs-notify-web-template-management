'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { zodValidate } from '@utils/validate-template';
import { $SubmittedNHSAppTemplate } from '@utils/zod-validators';

const NhsAppTemplateSubmittedPage = async ({
  params: { templateId },
}: TemplateSubmittedPageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($SubmittedNHSAppTemplate, template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default NhsAppTemplateSubmittedPage;
