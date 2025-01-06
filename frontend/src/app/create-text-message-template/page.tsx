import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import {
  SMSTemplate,
  Draft,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

const CreateSMSTemplatePage = async () => {
  const initialState: Draft<SMSTemplate> = {
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
