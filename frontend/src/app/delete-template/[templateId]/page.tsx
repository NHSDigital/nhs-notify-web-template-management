'use server';

import {
  PageProps,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { DeleteTemplate } from '@forms/DeleteTemplate/DeleteTemplate';
import { validateChannelTemplate } from '@utils/validate-template';

const DeleteTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  if (template?.templateStatus === TemplateStatus.DELETED) {
    return redirect('/manage-templates', RedirectType.push);
  }

  const validatedTemplate = validateChannelTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <DeleteTemplate template={validatedTemplate} />;
};

export default DeleteTemplatePage;
