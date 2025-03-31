'use server';

import {
  PageProps,
  validateSubmittedSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';

const ViewSubmittedSMSTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedSMSTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewSMSTemplate initialState={validatedTemplate} />;
};

export default ViewSubmittedSMSTemplatePage;
