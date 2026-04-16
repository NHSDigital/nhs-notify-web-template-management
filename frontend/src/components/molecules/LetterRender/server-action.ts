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
import { generateLetterProof } from '@utils/form-actions';
import type { LetterProofRequest } from 'nhs-notify-web-template-management-types';
import { PERSONALISATION_FORMDATA_PREFIX } from '@utils/constants';
import { format as formatDate } from 'date-fns';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { interpolate } from '@utils/interpolate';

const { pdsSection, customSection } = copy.components.letterRender;

const $FormSchema = z.object({
  systemPersonalisationPackId: z.enum(EXAMPLE_RECIPIENT_IDS, {
    message: pdsSection.error.invalid,
  }),
  templateId: z.uuidv4(),
  lockNumber: $LockNumber,
  tab: z.enum(['longFormRender', 'shortFormRender']),
});

const systemPackIdErrorKey = (tab?: string) =>
  `system-personalisation-pack-id-${tab}`;

export async function updateLetterPreview(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(formData.entries()));

  const fields = formDataToFormStateFields(formData);
  const { tab } = fields;

  const personalisationFieldErrors: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (key.startsWith(PERSONALISATION_FORMDATA_PREFIX) && !value) {
      const fieldName = key.slice(PERSONALISATION_FORMDATA_PREFIX.length);
      personalisationFieldErrors[`custom-${fieldName}-${tab}`] = [
        interpolate(customSection.error.required, { field: fieldName }),
      ];
    }
  }

  if (result.error) {
    const baseError = z.flattenError(result.error);
    const { systemPersonalisationPackId, ...otherFieldErrors } =
      baseError.fieldErrors;

    return {
      errorState: {
        ...baseError,
        fieldErrors: {
          // need to convert to field id so summary link works
          ...(systemPersonalisationPackId && {
            [systemPackIdErrorKey(tab)]: systemPersonalisationPackId,
          }),
          ...otherFieldErrors,
          ...personalisationFieldErrors,
        },
      },
      fields,
    };
  }

  if (Object.keys(personalisationFieldErrors).length > 0) {
    return {
      errorState: {
        fieldErrors: personalisationFieldErrors,
      },
      fields,
    };
  }

  const { templateId, systemPersonalisationPackId, lockNumber } = result.data;

  const customPersonalisation = Object.fromEntries(
    Object.entries(fields).flatMap(([k, v]) =>
      k.startsWith(PERSONALISATION_FORMDATA_PREFIX)
        ? [[k.slice(PERSONALISATION_FORMDATA_PREFIX.length), String(v)]]
        : []
    )
  );

  const systemPersonalisation = (
    tab === 'longFormRender'
      ? LONG_EXAMPLE_RECIPIENTS
      : SHORT_EXAMPLE_RECIPIENTS
  ).find((r) => r.id === systemPersonalisationPackId)?.data;

  if (!systemPersonalisation) {
    return {
      errorState: {
        fieldErrors: {
          [systemPackIdErrorKey(tab)]: [pdsSection.error.invalid],
        },
      },
      fields,
    };
  }

  const personalisation = {
    ...customPersonalisation,
    ...systemPersonalisation,
    date: formatDate(new Date(), 'd LLLL yyyy'),
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
