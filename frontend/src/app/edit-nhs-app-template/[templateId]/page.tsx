'use server';

import { getCsrfFormValue } from '@utils/csrf-utils';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateNHSAppTemplate } from '@utils/validate-template';

const CreateNhsAppTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <NhsAppTemplateForm
      initialState={validatedTemplate}
      csrfToken={csrfToken}
    />
  );
};

export default CreateNhsAppTemplatePage;
