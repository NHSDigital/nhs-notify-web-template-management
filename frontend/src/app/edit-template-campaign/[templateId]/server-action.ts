'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { patchTemplate } from '@utils/form-actions';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';

const content = copy.pages.editTemplateCampaignPage;

const $FormSchema = z.object({
  campaignId: z
    .string(content.form.campaignId.errors.empty)
    .nonempty(content.form.campaignId.errors.empty),
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
});

export async function editTemplateCampaign(
  state: FormState,
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

  const { campaignId, lockNumber, templateId } = result.data;

  await patchTemplate(templateId, { campaignId }, lockNumber);

  redirect(`/preview-letter-template/${result.data.templateId}`);
}
