'use server';

import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';

const $FormSchema = z.object({
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
});

export async function submitAuthoringLetterAction(
  _: FormState,
  form: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(form.entries()));

  if (result.error) {
    return {
      errorState: z.flattenError(result.error),
    };
  }

  const { templateId, lockNumber } = result.data;

  // destination TBD
  redirect(`/submit-letter-template/${templateId}?lockNumber=${lockNumber}`);
}
