'use server';

import { z } from 'zod/v4';
import { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';

const { errors } = copy.pages.uploadStandardLetterTemplate;

export const DOCX_MIME: z.core.util.MimeTypes =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const $FormSchema = z.object({
  name: z.string(errors.name.empty).nonempty(errors.name.empty),
  campaignId: z
    .string(errors.campaignId.empty)
    .nonempty(errors.campaignId.empty),
  file: z.file(errors.file.empty).mime(DOCX_MIME, errors.file.empty),
});

export type FormSchema = z.infer<typeof $FormSchema>;

export async function uploadStandardLetterTemplate(
  _: FormState<FormSchema>,
  form: FormData
): Promise<FormState<FormSchema>> {
  const fields = Object.fromEntries(form.entries());

  const validation = $FormSchema.safeParse(fields);

  if (validation.error) {
    return {
      errorState: z.flattenError(validation.error),
      fields,
    };
  }

  // TODO: CCM-14211 - submit the form and redirect instead of returning
  return { fields };
}
