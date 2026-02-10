'use server';

import { redirect, RedirectType } from 'next/navigation';
import type { FormState } from 'nhs-notify-web-template-management-utils';

/**
 * No-op server action for pages that display errors but don't submit forms.
 * Used by PDF letter preview which shows template status errors but has no submit action.
 */
export async function noOpServerAction(state: FormState): Promise<FormState> {
  return state;
}

/**
 * Server action for submitting an authoring letter template.
 *
 * TD: CCM-XXXXX - Implement actual submission logic:
 * - Validate that short/long form renders have been created
 * - Call backend API to submit the template
 * - Handle errors and return appropriate error state
 */
export async function submitAuthoringLetterAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const templateId = formData.get('templateId') as string;
  const lockNumber = formData.get('lockNumber') as string;

  // TD: Implement validation
  // - Check if renders have been created
  // const template = await getTemplate(templateId);
  // if (!template.files.shortFormRender || !template.files.longFormRender) {
  //   return {
  //     ...formState,
  //     errorState: {
  //       formErrors: ['You must preview your letter with both short and long examples before submitting'],
  //     },
  //   };
  // }

  // Redirect to submit page on success
  redirect(
    `/submit-letter-template/${templateId}?lockNumber=${lockNumber}`,
    RedirectType.push
  );
}
