import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { NHSAppTemplate, Draft } from '@utils/types';
import { TemplateType } from '@utils/enum';

const CreateNHSAppTemplatePage = async () => {
  const initialState: Draft<NHSAppTemplate> = {
    templateType: TemplateType.NHS_APP,
    version: 1,
    name: '',
    message: '',
  };

  return <CreateNhsAppTemplate initialState={initialState} />;
};

export default CreateNHSAppTemplatePage;
