'use server';

import {
  PageProps,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { PreviewSMSTemplate } from '@forms/PreviewSMSTemplate';

const PreviewSMSTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSMSTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <PreviewSMSTemplate initialState={validatedTemplate} />;
};

export default PreviewSMSTemplatePage;
