import {
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';

export const $FormSchema = z.object({
  previewLetterTemplateAction: z.enum(['letter-edit', 'letter-submit'], {
    message: 'Select an option',
  }),
});

export async function previewLetterTemplateAction(
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

  if (data.previewLetterTemplateAction === 'letter-edit') {
    return redirect(`/edit-letter-template/${formState.id}`, RedirectType.push);
  }

  if (data.previewLetterTemplateAction === 'letter-submit') {
    return redirect(
      `/submit-letter-template/${formState.id}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown preview letter template action.');
}
