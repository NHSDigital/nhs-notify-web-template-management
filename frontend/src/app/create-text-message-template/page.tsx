import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import {
  TemplateType,
  CreateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';

const CreateSMSTemplatePage = async () => {
  const initialState: CreateSMSTemplate = {
    templateType: TemplateType.SMS,
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
