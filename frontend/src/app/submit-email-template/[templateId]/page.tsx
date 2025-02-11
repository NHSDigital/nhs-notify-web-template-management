'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getCsrfFormValue } from '@utils/csrf-utils';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { validateEmailTemplate } from '@utils/validate-template';

const SubmitEmailTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <SubmitTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-email-template'
      submitPath='email-template-submitted'
      csrfToken={csrfToken}
    />
  );
};

export default SubmitEmailTemplatePage;
