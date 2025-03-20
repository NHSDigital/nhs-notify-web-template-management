'use server';

import {
  PageProps,
  validateSubmittedEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';

const ViewSubmittedEmailTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedEmailTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewEmailTemplate initialState={validatedTemplate} />;
};

export default ViewSubmittedEmailTemplatePage;
