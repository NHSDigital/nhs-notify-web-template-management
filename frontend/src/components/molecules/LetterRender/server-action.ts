'use server';

import type { LetterPreviewVariant, UpdatePreviewResult } from './types';

type UpdateLetterPreviewInput = {
  templateId: string;
  variant: LetterPreviewVariant;
  pdsPersonalisationPackId: string;
  personalisationParameters: Record<string, string>;
};

/**
 * Server action for updating the letter preview with personalisation data.
 *
 * Note: The actual PDF re-render functionality will be implemented in CCM-13495.
 * This action currently just returns success (no validation required per requirements).
 */
export async function updateLetterPreview(
  _input: UpdateLetterPreviewInput
): Promise<UpdatePreviewResult> {
  // TODO: CCM-13495 - Call backend API to trigger render
  // const response = await backendClient.triggerLetterRender({
  //   templateId: input.templateId,
  //   variant: input.variant,
  //   pdsPersonalisationPackId: input.pdsPersonalisationPackId,
  //   personalisationParameters: input.personalisationParameters,
  // });
  //
  // if (!response.success) {
  //   return {
  //     success: false,
  //     errors: response.errors,
  //   };
  // }
  //
  // return {
  //   success: true,
  //   pdfUrl: response.pdfUrl,
  // };

  // For now, just return success - no validation required per requirements
  // The pdfUrl will be updated when CCM-13495 implements the actual render
  return {
    success: true,
  };
}
