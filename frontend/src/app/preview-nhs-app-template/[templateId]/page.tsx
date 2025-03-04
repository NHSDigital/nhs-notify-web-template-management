'use server';

import { PreviewNHSAppTemplate } from '@forms/PreviewNHSAppTemplate/PreviewNHSAppTemplate';
import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateNHSAppTemplate } from '@utils/validate-template';

const PreviewNhsAppTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateNHSAppTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <PreviewNHSAppTemplate initialState={validatedTemplate} />;
};

export default PreviewNhsAppTemplatePage;
