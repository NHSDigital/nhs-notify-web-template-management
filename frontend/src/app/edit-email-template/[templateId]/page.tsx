import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { NHSNotifyContainer } from '@layouts/container/container';
import {
  TemplatePageProps,
  validateEmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';
import content from '@content/content';

const { editPageTitle } = content.components.templateFormEmail;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: editPageTitle,
  };
}

const CreateEmailTemplatePage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateEmailTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <EmailTemplateForm initialState={validatedTemplate} />
    </NHSNotifyContainer>
  );
};

export default CreateEmailTemplatePage;
