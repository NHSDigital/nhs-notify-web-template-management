import { Metadata } from 'next';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { CreateUpdateEmailTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { pageTitle } = content.components.templateFormEmail;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateEmailTemplatePage = async () => {
  const initialState: CreateUpdateEmailTemplate = {
    templateType: 'EMAIL',
    name: '',
    subject: '',
    message: '',
    clientId: '',
    userId: ''
  };

  return <EmailTemplateForm initialState={initialState} />;
};

export default CreateEmailTemplatePage;
