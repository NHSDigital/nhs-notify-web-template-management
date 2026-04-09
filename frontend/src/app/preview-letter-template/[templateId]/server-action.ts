'use server';

import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';

const { approveErrors } = content.pages.previewLetterTemplate;

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

  const template = await getTemplate(templateId);
  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || validatedTemplate.letterVersion !== 'AUTHORING') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const fieldErrors: Record<string, string[]> = {};

  if (validatedTemplate.files.shortFormRender?.status !== 'RENDERED') {
    fieldErrors['tab-short'] = [approveErrors.shortExampleRequired];
  }

  if (validatedTemplate.files.longFormRender?.status !== 'RENDERED') {
    fieldErrors['tab-long'] = [approveErrors.longExampleRequired];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { errorState: { fieldErrors } };
  }

  redirect(
    `/get-ready-to-approve-letter-template/${templateId}?lockNumber=${lockNumber}`
  );
}
