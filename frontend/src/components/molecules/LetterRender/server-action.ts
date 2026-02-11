'use server';

import type { UpdateLetterPreviewInput } from './types';

/**
 * Server action for updating the letter preview with personalisation data.
 *
 * TODO: CCM-13495 - Implement actual PDF re-render functionality
 */
export async function updateLetterPreview(
  input: UpdateLetterPreviewInput
): Promise<void> {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const _personalisationWithDate = {
    ...input.personalisation,
    date,
  };

  // no-op - personalisationWithDate will be sent to backend in CCM-13495
}
