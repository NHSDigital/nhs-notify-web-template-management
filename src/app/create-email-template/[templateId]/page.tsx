import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { PageProps, TemplateType } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateEmailTemplatePage = async ({
  params: { templateId },
}: PageProps) => {
  const template = await getTemplate(templateId);

  if (!template || template.templateType !== TemplateType.EMAIL) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return <CreateEmailTemplate initialState={template} />;
};

export default CreateEmailTemplatePage;
