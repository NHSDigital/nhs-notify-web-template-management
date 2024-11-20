'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { validateSMSTemplate } from '@utils/validate-template';

const SubmitSmsTemplatePage = async ({ params: { templateId } }: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={validatedTemplate.name}
      templateId={validatedTemplate.id}
      goBackPath='preview-text-message-template'
      submitPath='text-message-template-submitted'
    />
  );
};

export default SubmitSmsTemplatePage;