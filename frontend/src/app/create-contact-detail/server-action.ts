'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import { redirect, RedirectType } from 'next/navigation';
import { createContactDetail } from '@utils/form-actions';

const $FormSchema = z.object({
  contactDetail: z.string(),
});

export async function processForm(
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

  const { id } = await createContactDetail({
    contactDetailType: 'SMS',
    contactDetailValue: validation.data.contactDetail,
  });

  return redirect(`/verify-contact-detail/${id}`, RedirectType.push);
}
