'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from '@utils/types';
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

  return (
    <SubmitTemplate
      templateName={validatedTemplate.EMAIL.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-email-template'
      submitPath='email-template-submitted'
    />
  );
};

export default SubmitEmailTemplatePage;
