import { redirect, RedirectType } from 'next/navigation';
import { setTemplateToDeleted } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';

export const deleteTemplateNoAction = async () => {
  redirect('/message-templates', RedirectType.push);
};

export const deleteTemplateYesAction = async (
  template: TemplateDto
): Promise<never> => {
  await setTemplateToDeleted(template.id, template.lockNumber);

  redirect('/message-templates', RedirectType.push);
};
