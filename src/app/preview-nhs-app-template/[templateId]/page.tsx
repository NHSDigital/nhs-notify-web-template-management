'use server';

import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps } from '@utils/types';
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

  return <ReviewNHSAppTemplate initialState={validatedTemplate} />;
};

export default PreviewNhsAppTemplatePage;
