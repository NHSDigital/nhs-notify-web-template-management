'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSubmittedSMSTemplate } from '@utils/validate-template';

const SmsTemplateSubmittedPage = async (props: TemplateSubmittedPageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default SmsTemplateSubmittedPage;
