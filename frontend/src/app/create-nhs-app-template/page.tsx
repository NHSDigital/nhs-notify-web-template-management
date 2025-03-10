import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import {
  TemplateType,
  CreateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';

const CreateNHSAppTemplatePage = async () => {
  const initialState: CreateNHSAppTemplate = {
    templateType: 'NHS_APP',
    name: '',
    message: '',
  };

  return <NhsAppTemplateForm initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
