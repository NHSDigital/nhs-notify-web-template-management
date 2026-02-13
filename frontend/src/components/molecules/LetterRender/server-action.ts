'use server';

import { z } from 'zod/v4';
import copy from '@content/content';
import { EXAMPLE_RECIPIENT_IDS } from '@content/example-recipients';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import type { LetterRenderFormState } from './types';

const { pdsSection } = copy.components.letterRender;

const $FormSchema = z.object({
  systemPersonalisationPackId: z.enum(EXAMPLE_RECIPIENT_IDS, {
    message: pdsSection.error.invalid,
  }),
});

export async function updateLetterPreview(
  formState: LetterRenderFormState,
  formData: FormData
): Promise<LetterRenderFormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(formData.entries()));

  const fields = formDataToFormStateFields(formData);

  if (result.error) {
    return {
      ...formState,
      errorState: z.flattenError(result.error),
      fields,
    };
  }

  const { errorState: _, ...rest } = formState;

  return {
    ...rest,
    fields,
  };
}
