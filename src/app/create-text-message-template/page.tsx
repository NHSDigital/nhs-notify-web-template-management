import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { SMSTemplate, Draft } from '@utils/types';
import { TemplateType } from '@utils/enum';

const CreateSMSTemplatePage = async () => {
  const initialState: Draft<SMSTemplate> = {
    templateType: TemplateType.SMS,
    version: 1,
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
