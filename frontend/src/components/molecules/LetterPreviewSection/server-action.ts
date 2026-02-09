'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import { getBasePath } from '@utils/get-base-path';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import type { LetterPreviewFormState, LetterPreviewVariant } from './types';

const $UpdateLetterPreviewSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  variant: z.enum(['short', 'long']),
  lockNumber: z.string().min(1, 'Lock number is required'),
  pdsPersonalisationPackId: z.string().optional(),
});

/**
 * Server action for updating the letter preview with personalisation data.
 *
 * Note: The actual PDF re-render functionality will be implemented in CCM-13495.
 * This action currently validates the form and redirects back to the correct tab.
 */
export async function updateLetterPreview(
  _state: FormState,
  formData: FormData
): Promise<LetterPreviewFormState> {
  const basePath = getBasePath();

  // Extract form data
  const rawData = Object.fromEntries(formData.entries());

  // Validate required fields
  const parsed = $UpdateLetterPreviewSchema.safeParse(rawData);

  if (!parsed.success) {
    const flatErrors = parsed.error.flatten();
    return {
      errorState: {
        fieldErrors: flatErrors.fieldErrors as Record<string, string[]>,
        formErrors: flatErrors.formErrors,
      },
      templateId: rawData.templateId as string,
      variant: rawData.variant as LetterPreviewVariant,
      pdsPersonalisationPackId: rawData.pdsPersonalisationPackId as string,
    };
  }

  const { templateId, variant } = parsed.data;

  // Extract custom personalisation fields (prefixed with "custom_")
  const personalisationParameters: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('custom_') && typeof value === 'string') {
      const fieldName = key.replace('custom_', '');
      personalisationParameters[fieldName] = value;
    }
  }

  // TODO: CCM-13495 - Save personalisation data and trigger PDF re-render
  // await savePersonalisationData(templateId, variant, {
  //   pdsPersonalisationPackId: parsed.data.pdsPersonalisationPackId,
  //   personalisationParameters,
  // });

  // Redirect back to the template preview with the correct tab hash
  return redirect(
    `${basePath}/preview-letter-template/${templateId}#tab-${variant}`,
    RedirectType.push
  );
}
