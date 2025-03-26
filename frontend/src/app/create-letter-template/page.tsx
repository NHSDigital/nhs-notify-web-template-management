import { notFound } from 'next/navigation';
import { CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';

const CreateLetterTemplatePage = async () => {
  if (process.env.NEXT_PUBLIC_ENABLE_LETTERS !== 'true') notFound();

  const initialState: CreateLetterTemplate = {
    templateType: 'LETTER',
    name: '',
    letterType: 'x0',
    language: 'en',
  };

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
