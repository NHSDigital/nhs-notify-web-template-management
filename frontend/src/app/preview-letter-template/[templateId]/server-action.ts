'use server';

import { z } from 'zod/v4';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import type { FormState } from '@utils/types';
import { redirect } from 'next/navigation';
import content from '@content/content';

const { approveErrors } = content.pages.previewLetterTemplate;

const $FormSchema = z.object({
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
  shortFormRenderStatus: z.string(),
  longFormRenderStatus: z.string(),
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

  const {
    templateId,
    lockNumber,
    shortFormRenderStatus,
    longFormRenderStatus,
  } = result.data;

  const fieldErrors: Record<string, string[]> = {};

  if (shortFormRenderStatus !== 'RENDERED') {
    fieldErrors['tab-short'] = [approveErrors.shortExampleRequired];
  }

  if (longFormRenderStatus !== 'RENDERED') {
    fieldErrors['tab-long'] = [approveErrors.longExampleRequired];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { errorState: { fieldErrors } };
  }

  redirect(
    `/get-ready-to-approve-letter-template/${templateId}?lockNumber=${lockNumber}`
  );
}
