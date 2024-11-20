'use server';

import { PageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';
import { validateSMSTemplate } from '@utils/validate-template';

const PreviewSMSTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <ReviewSMSTemplate initialState={validatedTemplate} />;
};

export default PreviewSMSTemplatePage;
