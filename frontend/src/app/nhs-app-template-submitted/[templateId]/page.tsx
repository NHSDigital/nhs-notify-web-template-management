'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import {
  TemplateSubmittedPageProps,
  $SubmittedNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { zodValidate } from '@utils/validate-template';

const NhsAppTemplateSubmittedPage = async ({
  params: { templateId },
}: TemplateSubmittedPageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate($SubmittedNHSAppTemplate, template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name } = validatedTemplate;

  return <TemplateSubmitted templateId={id} templateName={name} />;
};

export default NhsAppTemplateSubmittedPage;
