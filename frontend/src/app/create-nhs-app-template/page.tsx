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

  return <NhsAppTemplateForm initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
