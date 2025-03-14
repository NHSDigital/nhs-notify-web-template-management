'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import {
  TemplateSubmittedPageProps,
  validateSubmittedEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const EmailTemplateSubmittedPage = async (
  props: TemplateSubmittedPageProps
) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { id, name, templateType } = validatedTemplate;

  return (
    <TemplateSubmitted
      templateId={id}
      templateName={name}
      templateType={templateType}
    />
  );
};

export default EmailTemplateSubmittedPage;
