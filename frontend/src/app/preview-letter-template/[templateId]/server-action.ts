'use server';

import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
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

  redirect(
    // temporary destination
    // TODO: CCM-14583 change to get ready to approve URL
    `/review-and-approve-letter-template/${templateId}?lockNumber=${lockNumber}`
  );
}
