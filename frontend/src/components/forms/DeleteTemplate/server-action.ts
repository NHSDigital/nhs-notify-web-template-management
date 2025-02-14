import { redirect, RedirectType } from 'next/navigation';
import {
  ChannelTemplate,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { saveTemplate } from '@utils/form-actions';

export const deleteTemplateNoAction = async () => {
  redirect('/manage-templates', RedirectType.push);
};

export const deleteTemplateYesAction = async (
  template: ChannelTemplate
): Promise<never> => {
  await saveTemplate({
    ...template,
    templateStatus: TemplateStatus.DELETED,
  });

  redirect('/manage-templates', RedirectType.push);
};
