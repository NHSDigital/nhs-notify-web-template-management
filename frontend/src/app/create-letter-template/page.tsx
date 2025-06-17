import { CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';

const CreateLetterTemplatePage = async () => {
  const initialState: CreateLetterTemplate = {
    templateType: 'LETTER',
    name: '',
    letterType: 'x0',
    language: 'en',
    clientId: '',
    userId: '',
  };

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
