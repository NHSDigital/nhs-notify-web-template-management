import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { SMSTemplate, Draft } from '@utils/types';
import { TemplateType, TemplateStatus } from '@utils/enum';

const CreateSMSTemplatePage = async () => {
  const initialState: Draft<SMSTemplate> = {
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    version: 1,
    name: '',
    message: '',
  };

  return <SmsTemplateForm initialState={initialState} />;
};

export default CreateSMSTemplatePage;
