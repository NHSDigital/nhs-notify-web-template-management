import {
  SMSTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import content from '@content/content';

const {
  components: {
    previewSMSTemplate: { form },
  },
} = content;

export const $FormSchema = z.object({
  previewSMSTemplateAction: z.enum(['sms-edit', 'sms-submit'], {
    message: form.previewSMSTemplateAction.error.empty,
  }),
});

export async function previewSmsTemplateAction(
  formState: TemplateFormState<SMSTemplate>,
  formData: FormData
): Promise<TemplateFormState<SMSTemplate>> {
  const formFields = Object.fromEntries(formData.entries());

  const { success, error, data } = $FormSchema.safeParse(formFields);

  if (!success) {
    return {
      ...formState,
      errorState: z.flattenError(error),
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
      `/submit-text-message-template/${formState.id}?lockNumber=${formState.lockNumber}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown preview sms template action.');
}
