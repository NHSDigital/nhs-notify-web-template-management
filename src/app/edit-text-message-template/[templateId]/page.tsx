'use server';

import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { PageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSMSTemplate } from '@utils/validate-template';

const CreateSmsTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <SmsTemplateForm initialState={validatedTemplate} />;
};

export default CreateSmsTemplatePage;
