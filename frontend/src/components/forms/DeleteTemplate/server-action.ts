import { redirect, RedirectType } from 'next/navigation';
import { saveTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';

export const deleteTemplateNoAction = async () => {
  redirect('/message-templates', RedirectType.push);
};

export const deleteTemplateYesAction = async (
  template: TemplateDto
): Promise<never> => {
  await saveTemplate({
    ...template,
    templateStatus: 'DELETED',
  });

  redirect('/message-templates', RedirectType.push);
};
