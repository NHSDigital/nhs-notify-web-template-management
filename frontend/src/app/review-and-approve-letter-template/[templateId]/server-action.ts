'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { approveTemplate } from '@utils/form-actions';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';

const $FormSchema = z.object({
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
});

export async function reviewAndApproveLetterTemplateAction(
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

  await approveTemplate(templateId, lockNumber);

  redirect(`/letter-template-approved/${templateId}`);
}
