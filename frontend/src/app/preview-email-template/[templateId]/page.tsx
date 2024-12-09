'use server';

import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ReviewEmailTemplate } from '@forms/ReviewEmailTemplate';
import { validateEmailTemplate } from '@utils/validate-template';

const PreviewEmailTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ReviewEmailTemplate initialState={validatedTemplate} />;
};

export default PreviewEmailTemplatePage;
