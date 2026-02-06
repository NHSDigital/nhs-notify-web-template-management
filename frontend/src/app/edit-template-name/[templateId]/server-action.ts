'use server';

import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import { redirect } from 'next/navigation';
import { patchTemplate } from '@utils/form-actions';

const content = copy.pages.editTemplateNamePage;

const $FormSchema = z.object({
  name: z
    .string(content.form.name.errors.empty)
    .nonempty(content.form.name.errors.empty),
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
});

export async function editTemplateName(
  _: FormState,
  form: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(form.entries()));

  const fields = formDataToFormStateFields(form);

  if (result.error) {
    return {
      errorState: z.flattenError(result.error),
      fields,
    };
  }

  const { name, lockNumber, templateId } = result.data;

  await patchTemplate(templateId, { name }, lockNumber);

  redirect(`/preview-letter-template/${result.data.templateId}`);
}
