'use server';

import { getCsrfFormValue } from '@utils/csrf-utils';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateNHSAppTemplate } from '@utils/validate-template';

const PreviewNhsAppTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const csrfToken = await getCsrfFormValue();

  return (
    <ReviewNHSAppTemplate
      initialState={validatedTemplate}
      csrfToken={csrfToken}
    />
  );
};

export default PreviewNhsAppTemplatePage;
