import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import { Metadata } from 'next';
import { CreateNHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { pageTitle } = content.components.templateFormNhsApp;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateNHSAppTemplatePage = async () => {
  const initialState: CreateNHSAppTemplate = {
    templateType: 'NHS_APP',
    name: '',
    message: '',
  };

  return <NhsAppTemplateForm initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
