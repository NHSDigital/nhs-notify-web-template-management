import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import {
  EmailTemplate,
  Draft,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

const CreateEmailTemplatePage = async () => {
  const initialState: Draft<EmailTemplate> = {
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    version: 1,
    name: '',
    subject: '',
    message: '',
  };

  return <EmailTemplateForm initialState={initialState} />;
};

export default CreateEmailTemplatePage;
