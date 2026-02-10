'use server';

import {
  TemplatePageProps,
  validateNonSubmittedTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { DeleteTemplate } from '@forms/DeleteTemplate/DeleteTemplate';
import { NHSNotifyContainer } from '@layouts/container/container';

const DeleteTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  if (template?.templateStatus === 'DELETED') {
    return redirect('/message-templates', RedirectType.push);
  }

  const validatedTemplate = validateNonSubmittedTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <DeleteTemplate template={validatedTemplate} />
    </NHSNotifyContainer>
  );
};

export default DeleteTemplatePage;
