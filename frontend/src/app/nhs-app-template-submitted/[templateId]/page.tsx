'use server';

import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { TemplateSubmittedPageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateSubmittedNHSAppTemplate } from '@utils/validate-template';

const NhsAppTemplateSubmittedPage = async (
  props: TemplateSubmittedPageProps
) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateSubmittedNHSAppTemplate(template);

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

export default NhsAppTemplateSubmittedPage;
