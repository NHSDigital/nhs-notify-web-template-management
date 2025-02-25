'use server';

import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateLetterTemplate } from '@utils/validate-template';
import { ReviewLetterTemplate } from '@forms/ReviewLetterTemplate/ReviewLetterTemplate';

const PreviewLetterTemplatePage = async (props: PageProps) => {
  if (process.env.NEXT_PUBLIC_ENABLE_LETTERS !== 'true') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <ReviewLetterTemplate initialState={validatedTemplate} />;
};

export default PreviewLetterTemplatePage;
