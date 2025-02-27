import {
  SMSTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';

export const $FormSchema = z.object({
  previewSMSTemplateAction: z.enum(['sms-edit', 'sms-submit'], {
    message: 'Select an option',
  }),
});

export async function previewSmsTemplateAction(
  formState: TemplateFormState<SMSTemplate>,
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

  if (data.previewSMSTemplateAction === 'sms-edit') {
    return redirect(
      `/edit-text-message-template/${formState.id}`,
      RedirectType.push
    );
  }

  if (data.previewSMSTemplateAction === 'sms-submit') {
    return redirect(
      `/submit-text-message-template/${formState.id}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown preview sms template action.');
}
