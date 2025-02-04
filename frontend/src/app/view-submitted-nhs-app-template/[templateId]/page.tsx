'use server';

import { PageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSubmittedNHSAppTemplate } from '@utils/validate-template';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';

const ViewSubmittedNHSAppTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedNHSAppTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return <ViewNHSAppTemplate initialState={validatedTemplate} />;
};

export default ViewSubmittedNHSAppTemplatePage;
