import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import {
  CreateEmailTemplate,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

const CreateEmailTemplatePage = async () => {
  const initialState: CreateEmailTemplate = {
    templateType: 'EMAIL',
    name: '',
    subject: '',
    message: '',
  };

  return <EmailTemplateForm initialState={initialState} />;
};

export default CreateEmailTemplatePage;
