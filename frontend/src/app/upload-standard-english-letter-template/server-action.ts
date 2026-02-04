'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { DOCX_MIME } from '@forms/UploadDocxLetterTemplateForm/form';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';

const { errors } = copy.components.uploadDocxLetterTemplateForm;

const $FormSchema = z.object({
  name: z.string(errors.name.empty).nonempty(errors.name.empty),
  campaignId: z
    .string(errors.campaignId.empty)
    .nonempty(errors.campaignId.empty),
  file: z
    .instanceof(File, { error: errors.file.empty })
    .refine((file) => file.type === DOCX_MIME, errors.file.empty),
});

export async function uploadStandardLetterTemplate(
  _: FormState,
  form: FormData
): Promise<FormState> {
  const validation = $FormSchema.safeParse(Object.fromEntries(form.entries()));

  const fields = formDataToFormStateFields(form);

  if (validation.error) {
    return {
      errorState: z.flattenError(validation.error),
      fields,
    };
  }

  // TODO: CCM-14211 - submit the form and redirect instead of returning
  return { fields };
}
