import { getCsrfFormValue } from '@utils/csrf-utils';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateEmailTemplate } from '@utils/validate-template';

const CreateEmailTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <EmailTemplateForm initialState={validatedTemplate} csrfToken={csrfToken} />
  );
};

export default CreateEmailTemplatePage;
