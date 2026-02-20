'use server';

import { z } from 'zod/v4';
import { redirect, RedirectType } from 'next/navigation';
import { LANGUAGE_LIST } from 'nhs-notify-backend-client';
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
  language: z.enum(LANGUAGE_LIST, errors.language.empty).exclude(['en']),
  file: z
    .file(errors.file.empty)
    .mime(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      errors.file.empty
    ),
});

export async function uploadOtherLanguageLetterTemplate(
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

  const { name, campaignId, file, language } = validation.data;

  const template: UploadLetterTemplate = {
    name,
    campaignId,
    letterType: 'x0',
    language,
    templateType: 'LETTER',
    letterVersion: 'AUTHORING',
  };

  const savedTemplate = await uploadDocxTemplate(template, file);

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
