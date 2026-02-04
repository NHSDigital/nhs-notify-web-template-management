'use server';

import { z } from 'zod/v4';
import { LANGUAGE_LIST } from 'nhs-notify-backend-client';
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
  language: z.enum(LANGUAGE_LIST, errors.language.empty).exclude(['en']),
  file: z.file(errors.file.empty).mime(DOCX_MIME, errors.file.empty),
});

export async function uploadOtherLanguageLetterTemplate(
  _: FormState,
  form: FormData
): Promise<FormState> {
  const obj = Object.fromEntries(form.entries());
  const fileFromGet = form.get('file');

  console.log('obj.file ->', obj.file);
  console.log('fileFromGet ->', fileFromGet);
  console.log('fileFromGet instanceof File ->', fileFromGet instanceof File);
  console.log('typeof obj.file ->', typeof obj.file);

  const validation = $FormSchema.safeParse(obj);

  const fields = formDataToFormStateFields(form);

  if (validation.error) {
    console.log(validation.error);

    return {
      errorState: z.flattenError(validation.error),
      fields,
    };
  }

  // TODO: CCM-14211 - submit the form and redirect instead of returning
  return { fields };
}
