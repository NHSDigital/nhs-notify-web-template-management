/* eslint-disable sonarjs/no-commented-code */
'use server';

import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import {
  EXAMPLE_RECIPIENT_IDS,
  LONG_EXAMPLE_RECIPIENTS,
  SHORT_EXAMPLE_RECIPIENTS,
} from '@content/example-recipients';
import { formDataToFormStateFields } from '@utils/form-data-to-form-state';
import { $LockNumber } from 'nhs-notify-backend-client';
import { generateLetterProof } from '@utils/form-actions';
import type { LetterProofRequest } from 'nhs-notify-web-template-management-types';

const { pdsSection } = copy.components.letterRender;

const $FormSchema = z.object({
  systemPersonalisationPackId: z.enum(EXAMPLE_RECIPIENT_IDS, {
    message: pdsSection.error.invalid,
  }),
  templateId: z.string().nonempty(),
  lockNumber: $LockNumber,
  tab: z.enum(['longFormRender', 'shortFormRender']),
});

export async function updateLetterPreview(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(formData.entries()));

  const fields = formDataToFormStateFields(formData);

  if (result.error) {
    console.log(result.error);
    return {
      errorState: z.flattenError(result.error),
      fields,
    };
  }

  const { templateId, systemPersonalisationPackId, tab, lockNumber } =
    result.data;

  const customPersonalisation = Object.fromEntries(
    Object.entries(fields).flatMap(([k, v]) =>
      k.startsWith('__personalisation__') ? [[k.slice(19), String(v)]] : []
    )
  );

  const systemPersonalisation =
    (tab === 'longFormRender'
      ? LONG_EXAMPLE_RECIPIENTS
      : SHORT_EXAMPLE_RECIPIENTS
    ).find((r) => r.id === systemPersonalisationPackId)?.data ?? {};

  const personalisation = {
    ...customPersonalisation,
    ...systemPersonalisation,
    date: new Date().toISOString(),
  };

  const request: LetterProofRequest = {
    personalisation,
    systemPersonalisationPackId,
    requestTypeVariant: tab === 'longFormRender' ? 'long' : 'short',
  };

  await generateLetterProof(templateId, lockNumber, request);

  return {
    fields,
  };
}
