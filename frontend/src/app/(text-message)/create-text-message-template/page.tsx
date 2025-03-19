import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { CreateSMSTemplate } from 'nhs-notify-web-template-management-utils';

const CreateSMSTemplatePage = async () => {
  const initialState: CreateSMSTemplate = {
    templateType: 'SMS',
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
