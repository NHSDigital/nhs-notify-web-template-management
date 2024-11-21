import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import { NHSAppTemplate, Draft } from '@utils/types';
import { TemplateType, TemplateStatus } from '@utils/enum';

const CreateNHSAppTemplatePage = async () => {
  const initialState: Draft<NHSAppTemplate> = {
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    version: 1,
    name: '',
    message: '',
  };

  return <NhsAppTemplateForm initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
