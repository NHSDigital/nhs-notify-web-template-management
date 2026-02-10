'use server';

import { redirect, RedirectType } from 'next/navigation';
import type { FormState } from 'nhs-notify-web-template-management-utils';

/**
 * Server action for submitting an authoring letter template.
 *
 * TD: CCM-XXXXX - Implement actual submission logic:
 * - Validate that a letter variant has been selected
 * - Validate that renders have been created
 * - Call backend API to submit the template
 * - Handle errors and return appropriate error state
 */
export async function submitAuthoringLetterAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const templateId = formData.get('templateId') as string;

  // TD: Implement validation
  // - Check if letter variant is selected
  // - Check if renders have been created
  // const template = await getTemplate(templateId);
  // if (!template.selectedVariant) {
  //   return {
  //     ...formState,
  //     errorState: {
  //       formErrors: ['Select a letter variant before submitting'],
  //     },
  //   };
  // }

  // For now, just redirect to submit page on success
  redirect(`/submit-letter-template/${templateId}`, RedirectType.push);
}
