import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { PageProps } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { validateEmailTemplate } from '@utils/validate-template';

const CreateEmailTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <CreateEmailTemplate initialState={validatedTemplate} />;
};

export default CreateEmailTemplatePage;
