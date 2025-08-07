import { LANGUAGE_LIST, LETTER_TYPE_LIST } from 'nhs-notify-backend-client';
import { z } from 'zod';
import content from '@content/content';

const {
  components: {
    templateFormLetter: { form },
  },
} = content;

export const $UploadLetterTemplateForm = z.object({
  letterTemplateName: z
    .string({ message: form.letterTemplateName.error.empty })
    .min(1, { message: form.letterTemplateName.error.empty }),
  letterTemplateLetterType: z.enum(LETTER_TYPE_LIST, {
    message: form.letterTemplateLetterType.error.empty,
  }),
  letterTemplateLanguage: z.enum(LANGUAGE_LIST, {
    message: form.letterTemplateLanguage.error.empty,
  }),
  letterTemplatePdf: z
    .instanceof(File, {
      message: form.letterTemplatePdf.error.empty,
    })
    .refine((pdf) => pdf.size <= 5 * 1024 * 1024, {
      message: form.letterTemplatePdf.error.tooLarge,
    })
    .refine((pdf) => pdf.type === 'application/pdf', {
      message: form.letterTemplatePdf.error.wrongFileFormat,
    }),
  letterTemplateCsv: z
    .instanceof(File, {
      message: form.letterTemplateCsv.error.empty,
    })
    .refine((csv) => csv.size <= 10 * 1024, {
      message: form.letterTemplateCsv.error.tooLarge,
    })
    .refine((csv) => csv.size === 0 || csv.type === 'text/csv', {
      message: form.letterTemplateCsv.error.wrongFileFormat,
    }),
});
