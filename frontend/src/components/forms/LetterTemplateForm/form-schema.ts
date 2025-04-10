import { LANGUAGE_LIST, LETTER_TYPE_LIST } from 'nhs-notify-backend-client';
import { z } from 'zod';

export const $CreateLetterTemplateForm = z.object({
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
