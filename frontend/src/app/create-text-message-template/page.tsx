import { Metadata } from 'next';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { CreateSMSTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { pageTitle } = content.components.templateFormSms;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateSMSTemplatePage = async () => {
  const initialState: CreateSMSTemplate = {
    templateType: 'SMS',
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
