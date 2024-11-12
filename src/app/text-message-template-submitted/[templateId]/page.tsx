'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSMSTemplate } from '@utils/validate-template';

const SmsTemplateSubmittedPage = async ({
  params: { templateId },
}: TemplateSubmittedPageProps) => {
  const template = await getTemplate(templateId);

  const validateTemplate = validateSMSTemplate(template);

  if (!validateTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validateTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default SmsTemplateSubmittedPage;
