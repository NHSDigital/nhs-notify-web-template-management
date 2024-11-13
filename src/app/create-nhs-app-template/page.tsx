import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import { NHSAppTemplate, Draft } from '@utils/types';
import { TemplateType } from '@utils/enum';

const CreateNHSAppTemplatePage = async () => {
  const initialState: Draft<NHSAppTemplate> = {
    templateType: TemplateType.NHS_APP,
    version: 1,
    name: '',
    message: '',
  };

  return <NhsAppTemplateForm initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
