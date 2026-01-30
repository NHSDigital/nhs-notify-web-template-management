import { z } from 'zod/v4';
import copy from '@content/content';

export const DOCX_MIME: z.core.util.MimeTypes =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const { errors } = copy.components.uploadDocxLetterTemplateForm;

export const $UploadDocxLetterTemplateFormSchema = z.object({
  name: z.string(errors.name.empty).nonempty(errors.name.empty),
  campaignId: z
    .string(errors.campaignId.empty)
    .nonempty(errors.campaignId.empty),
  file: z.file(errors.file.empty).mime(DOCX_MIME, errors.file.empty),
});

export type UploadDocxLetterTemplateFormSchema = z.infer<
  typeof $UploadDocxLetterTemplateFormSchema
>;
