'use server';

import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';
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

  return <CreateSmsTemplate initialState={validatedTemplate} />;
};

export default CreateSmsTemplatePage;
