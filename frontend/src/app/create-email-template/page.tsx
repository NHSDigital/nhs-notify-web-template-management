import { Metadata } from 'next';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { CreateEmailTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { pageTitle } = content.components.templateFormEmail;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateEmailTemplatePage = async () => {
  const initialState: CreateEmailTemplate = {
    templateType: 'EMAIL',
    name: '',
    subject: '',
    message: '',
  };

  return <EmailTemplateForm initialState={initialState} />;
};

export default CreateEmailTemplatePage;
