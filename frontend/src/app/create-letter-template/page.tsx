import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';

const CreateLetterTemplatePage = async () => {
  if (process.env.NEXT_PUBLIC_ENABLE_LETTERS !== 'true') notFound();

  const initialState: CreateLetterTemplate = {
    templateType: 'LETTER',
    name: '',
    letterType: 'x0',
    language: 'en',
    files: {
      pdfTemplate: {
        fileName: '',
      },
    },
  };

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
