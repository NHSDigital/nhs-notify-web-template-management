import { redirect, RedirectType } from 'next/navigation';
import { TemplateStatus } from 'nhs-notify-web-template-management-utils';
import { saveTemplate } from '@utils/form-actions';
import { TemplateDTO } from 'nhs-notify-backend-client';

export const deleteTemplateNoAction = async () => {
  redirect('/manage-templates', RedirectType.push);
};

export const deleteTemplateYesAction = async (
  template: TemplateDTO
): Promise<never> => {
  await saveTemplate({
    ...template,
    templateStatus: 'DELETED',
  });

  redirect('/manage-templates', RedirectType.push);
};
