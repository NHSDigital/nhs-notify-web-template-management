'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getCsrfFormValue } from '@utils/csrf-utils';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { validateSMSTemplate } from '@utils/validate-template';

const SubmitSmsTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <SubmitTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-text-message-template'
      submitPath='text-message-template-submitted'
      csrfToken={csrfToken}
    />
  );
};

export default SubmitSmsTemplatePage;
