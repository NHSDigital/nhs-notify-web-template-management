import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import { notFound } from 'next/navigation';
import { Language, LetterType } from 'nhs-notify-backend-client';
import {
  Draft,
  LetterTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

const CreateLetterTemplatePage = async () => {
  if (process.env.NEXT_PUBLIC_ENABLE_LETTERS !== 'true') notFound();

  const initialState: Draft<LetterTemplate> = {
    templateType: TemplateType.LETTER,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: '',
    letterType: LetterType.STANDARD,
    language: Language.ENGLISH,
    pdfTemplateInputFile: '',
  };

  return <LetterTemplateForm initialState={initialState} />;
};

export default CreateLetterTemplatePage;
