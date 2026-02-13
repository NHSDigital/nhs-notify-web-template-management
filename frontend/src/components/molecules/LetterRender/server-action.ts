'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { EXAMPLE_RECIPIENT_IDS } from '@content/example-recipients';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';

const { pdsSection } = copy.components.letterRender;

const $FormSchema = z.object({
  systemPersonalisationPackId: z.enum(EXAMPLE_RECIPIENT_IDS, {
    message: pdsSection.error.invalid,
  }),
});

export async function updateLetterPreview(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(formData.entries()));

  const fields = formDataToFormStateFields(formData);

  if (result.error) {
    return {
      ...formState,
      errorState: z.flattenError(result.error),
      fields,
    };
  }

  // combine form data custom personalisation with example recipient personalisation
  // add date
  // initiate polling

  const { errorState: _, ...rest } = formState;

  return {
    ...rest,
    fields,
  };
}
