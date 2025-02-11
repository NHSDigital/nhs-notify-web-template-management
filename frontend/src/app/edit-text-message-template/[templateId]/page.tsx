'use server';

import { getCsrfFormValue } from '@utils/csrf-utils';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSMSTemplate } from '@utils/validate-template';

const CreateSmsTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <SmsTemplateForm initialState={validatedTemplate} csrfToken={csrfToken} />
  );
};

export default CreateSmsTemplatePage;
