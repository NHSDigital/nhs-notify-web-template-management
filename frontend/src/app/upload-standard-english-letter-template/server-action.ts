'use server';

import { z } from 'zod/v4';
import { redirect, RedirectType } from 'next/navigation';
import type {
  FormState,
  UploadLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import { uploadDocxTemplate } from '@utils/form-actions';

const { errors } = copy.components.uploadDocxLetterTemplateForm;

const $FormSchema = z.object({
  name: z.string(errors.name.empty).nonempty(errors.name.empty),
  campaignId: z
    .string(errors.campaignId.empty)
    .nonempty(errors.campaignId.empty),
  file: z
    .file(errors.file.empty)
    .mime(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      errors.file.empty
    ),
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

  const { name, campaignId, file } = validation.data;

  const template: UploadLetterTemplate = {
    name,
    campaignId,
    letterType: 'x0',
    language: 'en',
    templateType: 'LETTER',
    letterVersion: 'AUTHORING',
  };

  const savedTemplate = await uploadDocxTemplate(template, file);

  return redirect(
    `/preview-letter-template/${savedTemplate.id}`,
    RedirectType.push
  );
}
