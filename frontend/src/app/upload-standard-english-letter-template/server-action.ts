'use server';

import { z } from 'zod/v4';
import type { UploadLetterTemplate } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import { uploadDocxTemplate } from '@utils/form-actions';

const { errors } = copy.components.uploadDocxLetterTemplateForm;

const $FormSchema = z.object({
  name: z
    .string(errors.name.empty)
    .nonempty(errors.name.empty)
    .default('dname'),
  campaignId: z
    .string(errors.campaignId.empty)
    .nonempty(errors.campaignId.empty)
    .default('campaign'),
});

export async function uploadStandardLetterTemplate(form: FormData) {
  const validation = $FormSchema.safeParse(Object.fromEntries(form.entries()));

  const fields = formDataToFormStateFields(form);

  if (validation.error) {
    return {
      errorState: z.flattenError(validation.error),
      fields,
    };
  }

  const { name, campaignId } = validation.data;

  const template: UploadLetterTemplate = {
    name,
    campaignId,
    letterType: 'x0',
    language: 'en',
    templateType: 'LETTER',
    letterVersion: 'AUTHORING',
  };

  const savedTemplate = await uploadDocxTemplate(template);

  return savedTemplate;
}
