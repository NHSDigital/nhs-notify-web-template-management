import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { EmailTemplate, Draft } from '@utils/types';
import { TemplateType } from '@utils/enum';

const CreateEmailTemplatePage = async () => {
  const initialState: Draft<EmailTemplate> = {
    templateType: TemplateType.EMAIL,
    version: 1,
    name: '',
    subject: '',
    message: '',
  };

  return <CreateEmailTemplate initialState={initialState} />;
};

export default CreateEmailTemplatePage;
