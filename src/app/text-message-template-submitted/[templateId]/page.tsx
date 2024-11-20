'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { zodValidate } from '@utils/validate-template';
import { $SubmittedSMSTemplate } from '@utils/zod-validators';

const SmsTemplateSubmittedPage = async ({
  params: { templateId },
}: TemplateSubmittedPageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($SubmittedSMSTemplate, template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default SmsTemplateSubmittedPage;
