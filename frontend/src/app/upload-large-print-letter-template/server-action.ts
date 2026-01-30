'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import {
  $UploadDocxLetterTemplateFormSchema,
  type UploadDocxLetterTemplateFormSchema,
} from '@forms/UploadDocxLetterTemplateForm/schema';

export async function uploadLargePrintLetterTemplate(
  _: FormState<UploadDocxLetterTemplateFormSchema>,
  form: FormData
): Promise<FormState<UploadDocxLetterTemplateFormSchema>> {
  const fields = Object.fromEntries(form.entries());

  const validation = $UploadDocxLetterTemplateFormSchema.safeParse(fields);

  if (validation.error) {
    return {
      errorState: z.flattenError(validation.error),
      fields,
    };
  }

  // TODO: CCM-14211 - submit the form and redirect instead of returning
  return { fields };
}
