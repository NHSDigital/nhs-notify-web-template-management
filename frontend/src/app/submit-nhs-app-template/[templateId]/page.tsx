'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getCsrfFormValue } from '@utils/csrf-utils';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { validateNHSAppTemplate } from '@utils/validate-template';

const SubmitNhsAppTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <SubmitTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-nhs-app-template'
      submitPath='nhs-app-template-submitted'
      csrfToken={csrfToken}
    />
  );
};

export default SubmitNhsAppTemplatePage;
