import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <LetterTemplateForm
      initialState={{
        ...validatedTemplate,
        files: {
          pdfTemplate: {
            fileName: '',
          },
        },
      }}
    />
  );
};

export default CreateLetterTemplatePage;
