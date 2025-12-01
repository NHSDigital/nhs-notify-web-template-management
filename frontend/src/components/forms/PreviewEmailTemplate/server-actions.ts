import {
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import content from '@content/content';

const {
  components: {
    previewEmailTemplate: { form },
  },
} = content;

export const $FormSchema = z.object({
  previewEmailTemplateAction: z.enum(['email-edit', 'email-submit'], {
    message: form.previewEmailTemplateAction.error.empty,
  }),
});

export async function previewEmailTemplateAction(
  formState: TemplateFormState<EmailTemplate>,
  formData: FormData
): Promise<TemplateFormState<EmailTemplate>> {
  const formFields = Object.fromEntries(formData.entries());

  const { success, error, data } = $FormSchema.safeParse(formFields);

  if (!success) {
    return {
      ...formState,
      errorState: z.flattenError(error),
    };
  }

  if (data.previewEmailTemplateAction === 'email-edit') {
    return redirect(`/edit-email-template/${formState.id}`, RedirectType.push);
  }

  if (data.previewEmailTemplateAction === 'email-submit') {
    return redirect(
      `/submit-email-template/${formState.id}?lockNumber=${formState.lockNumber}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown preview email template action.');
}
