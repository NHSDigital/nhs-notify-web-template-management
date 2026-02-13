import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import { Metadata } from 'next';
import { CreateUpdateNHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.templateFormNhsApp;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateNHSAppTemplatePage = async () => {
  const initialState: CreateUpdateNHSAppTemplate = {
    templateType: 'NHS_APP',
    name: '',
    message: '',
  };

  return (
    <NHSNotifyContainer>
      <NhsAppTemplateForm initialState={initialState} />
    </NHSNotifyContainer>
  );
};

export default CreateNHSAppTemplatePage;
