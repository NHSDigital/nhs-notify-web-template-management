'use server';

import type { RenderTab } from './types';

export type UpdateLetterPreviewInput = {
  templateId: string;
  tab: RenderTab;
  systemPersonalisationPackId: string;
  personalisationParameters: Record<string, string>;
};

/**
 * Server action for updating the letter preview with personalisation data.
 *
 * TODO: CCM-13495 - Implement actual PDF re-render functionality
 */
export async function updateLetterPreview(
  _input: UpdateLetterPreviewInput
): Promise<void> {
  // no-op
}
