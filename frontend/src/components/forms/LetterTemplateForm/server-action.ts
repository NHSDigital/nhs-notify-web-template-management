import { z } from 'zod';
import { createLetterTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { LANGUAGE_LIST, LETTER_TYPE_LIST } from 'nhs-notify-backend-client';
import {
  CreateLetterTemplate,
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';

const $CreateLetterTemplateSchema = z.object({
  letterTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  letterTemplateLetterType: z.enum(LETTER_TYPE_LIST, {
    message: 'Choose a letter type',
  }),
  letterTemplateLanguage: z.enum(LANGUAGE_LIST, {
    message: 'Choose a language',
  }),
  letterTemplatePdf: z
    .instanceof(File, {
      message: 'Select a letter template PDF',
    })
    .refine((pdf) => pdf.size <= 5 * 1024 * 1024, {
      message: `The letter template PDF is too large. The file must be smaller than 5MB`,
    })
    .refine((pdf) => pdf.type === 'application/pdf', {
      message: 'Select a letter template PDF',
    }),
  letterTemplateCsv: z
    .instanceof(File, {
      message: 'Select a valid test data .csv file',
    })
    .refine((csv) => csv.size <= 10 * 1024, {
      message: `The test data CSV is too large. The file must be smaller than 10KB`,
    })
    .refine((csv) => csv.size === 0 || csv.type === 'text/csv', {
      message: 'Select a valid test data .csv file',
    }),
});

export async function processFormActions(
  formState: TemplateFormState<CreateLetterTemplate | LetterTemplate>,
  formData: FormData
): Promise<TemplateFormState<CreateLetterTemplate>> {
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

  const {
    letterTemplateName,
    letterTemplateLetterType,
    letterTemplateLanguage,
    letterTemplatePdf,
    letterTemplateCsv,
  } = parsedForm.data;

  const updatedTemplate: CreateLetterTemplate = {
    ...formState,
    name: letterTemplateName,
    letterType: letterTemplateLetterType,
    language: letterTemplateLanguage,
  };

  if ('id' in updatedTemplate) {
    throw new Error('Update is not available for letter templates');
  }

  const savedTemplate = await createLetterTemplate(
    updatedTemplate,
    letterTemplatePdf,
    letterTemplateCsv
  );

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
