import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import {
  EmailTemplate,
  Draft,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { getCsrfFormValue } from '@utils/csrf-utils';

const CreateEmailTemplatePage = async () => {
  const initialState: Draft<EmailTemplate> = {
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: '',
    subject: '',
    message: '',
  };

  const csrfToken = await getCsrfFormValue();

  return (
    <EmailTemplateForm initialState={initialState} csrfToken={csrfToken} />
  );
};

export default CreateEmailTemplatePage;
