import {
  TemplateFormState,
  LetterTemplate,
  Draft,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { Language, LetterType } from 'nhs-notify-backend-client';

const $CreateLetterTemplateSchema = z.object({
  letterTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  letterType: z
    .string({ message: 'Enter a letter type' })
    .min(1, { message: 'Enter a letter type' }),
  letterLanguage: z
    .string({ message: 'Enter a letter language' })
    .min(1, { message: 'Enter a letter language' }),
  pdf: z
    .instanceof(File, {
      message: 'Please select a template pdf file.',
    })
    .refine((pdf) => pdf.size <= 5 * 1024 * 1024, {
      message: `The pdf is too large. Please choose a template pdf smaller than 5MB.`,
    })
    .refine((pdf) => pdf.type === 'application/pdf', {
      message: 'Please upload a valid .pdf file.',
    }),
  csv: z
    .instanceof(File, {
      message: 'Please select a sample data csv file.',
    })
    .refine((csv) => csv.size <= 10 * 1024, {
      message: `The csv is too large. Please provide sample data smaller than 10KB.`,
    })
    .refine((csv) => csv.size === 0 || csv.type === 'text/csv', {
      message: 'Please upload a valid .csv file.',
    }),
});

export async function processFormActions(
  formState: TemplateFormState<LetterTemplate | Draft<LetterTemplate>>,
  formData: FormData
): Promise<TemplateFormState<LetterTemplate | Draft<LetterTemplate>>> {
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

  const updatedTemplate = {
    ...formState,
    name: letterTemplateName,
    letterType: letterType as LetterType,
    language: letterLanguage as Language,
    pdfTemplateInputFile: pdf.name,
    ...(csv.size > 0 && { testPersonalisationInputFile: csv.name }),
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
