import { Metadata } from 'next';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { CreateUpdateSMSTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.templateFormSms;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const CreateSMSTemplatePage = async () => {
  const initialState: CreateUpdateSMSTemplate = {
    templateType: 'SMS',
    name: '',
    message: '',
  };

  return (
    <NHSNotifyContainer>
      <SmsTemplateForm initialState={initialState} />
    </NHSNotifyContainer>
  );
};

export default CreateSMSTemplatePage;
