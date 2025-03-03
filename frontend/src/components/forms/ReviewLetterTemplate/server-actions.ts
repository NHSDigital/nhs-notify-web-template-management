import {
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';

export const $FormSchema = z.object({
  reviewLetterTemplateAction: z.enum(['letter-edit', 'letter-submit'], {
    message: 'Select an option',
  }),
});

export async function reviewLetterTemplateAction(
  formState: TemplateFormState<LetterTemplate>,
  formData: FormData
) {
  const form = Object.fromEntries(formData.entries());

  const { success, error, data } = $FormSchema.safeParse(form);

  if (!success) {
    return {
      ...formState,
      validationError: error.flatten(),
    };
  }

  if (data.reviewLetterTemplateAction === 'letter-edit') {
    return redirect(`/edit-letter-template/${formState.id}`, RedirectType.push);
  }

  if (data.reviewLetterTemplateAction === 'letter-submit') {
    return redirect(
      `/submit-letter-template/${formState.id}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown review letter template action.');
}
