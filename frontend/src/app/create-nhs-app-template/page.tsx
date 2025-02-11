import { getCsrfFormValue } from '@utils/csrf-utils';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import {
  NHSAppTemplate,
  Draft,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

const CreateNHSAppTemplatePage = async () => {
  const initialState: Draft<NHSAppTemplate> = {
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: '',
    message: '',
  };

  const csrfToken = await getCsrfFormValue();

  return (
    <NhsAppTemplateForm initialState={initialState} csrfToken={csrfToken} />
  );
};

export default CreateNHSAppTemplatePage;
