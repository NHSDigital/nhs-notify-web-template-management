import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import {
  Draft,
  LetterTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

const CreateLetterTemplatePage = async () => {
  const initialState: Draft<LetterTemplate> = {
    templateType: TemplateType.LETTER,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: '',
    message: '',
  };

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
