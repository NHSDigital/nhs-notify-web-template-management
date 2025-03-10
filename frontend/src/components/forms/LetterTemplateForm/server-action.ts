import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { LANGUAGE_LIST, LETTER_TYPE_LIST } from 'nhs-notify-backend-client';
import {
  CreateLetterTemplate,
  CreateLetterTemplateWithFiles,
  LetterTemplate,
  LetterTemplateWithFiles,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';

const [firstLetterType, ...remainingLetterTypes] = LETTER_TYPE_LIST;
const [firstLanguage, ...remainingLanguages] = LANGUAGE_LIST;

const $CreateLetterTemplateSchema = z.object({
  letterTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  letterType: z.enum([firstLetterType, ...remainingLetterTypes], {
    message: 'Choose a letter type',
  }),
  letterLanguage: z.enum([firstLanguage, ...remainingLanguages], {
    message: 'Choose a language',
  }),
  pdf: z
    .instanceof(File, {
      message: 'Upload a template pdf file.',
    })
    .refine((pdf) => pdf.size <= 5 * 1024 * 1024, {
      message: `The pdf is too large. Please choose a template pdf smaller than 5MB.`,
    })
    .refine((pdf) => pdf.type === 'application/pdf', {
      message: 'Please upload a valid .pdf file.',
    }),
  csv: z
    .instanceof(File, {
      message: 'Upload a sample data csv file.',
    })
    .refine((csv) => csv.size <= 10 * 1024, {
      message: `The csv is too large. Please provide sample data smaller than 10KB.`,
    })
    .refine((csv) => csv.size === 0 || csv.type === 'text/csv', {
      message: 'Please upload a valid .csv file.',
    }),
});

export async function processFormActions(
  formState: TemplateFormState<
    LetterTemplateWithFiles | CreateLetterTemplateWithFiles
  >,
  formData: FormData
): Promise<
  TemplateFormState<LetterTemplateWithFiles | CreateLetterTemplateWithFiles>
> {
  const parsedForm = $CreateLetterTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  delete formState.validationError;

  const { letterTemplateName, letterType, letterLanguage, pdf, csv } =
    parsedForm.data;

  const updatedTemplate: CreateLetterTemplate | LetterTemplate = {
    ...formState,
    name: letterTemplateName,
    letterType: letterType,
    language: letterLanguage,
    files: {
      pdfTemplate: {
        fileName: pdf.name,
      },
      ...(csv.size > 0 && {
        testDataCsv: {
          fileName: csv.name,
        },
      }),
    },
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
