import { TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';

const $CreateSmsTemplateSchema = z.object({
  smsTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  smsTemplateMessage: z
    .string({ message: 'Enter a template message' })
    .min(1, { message: 'Enter a template message' })
    .max(MAX_SMS_CHARACTER_LENGTH, {
      message: 'Template message too long',
    }),
});

const $GoBackSchema = z.object({
  smsTemplateName: z.string({ message: 'Internal server error' }),
  smsTemplateMessage: z.string({ message: 'Internal server error' }),
});

const $FormIdSchema = z.object({
  formId: z.enum(['create-sms-template-back', 'create-sms-template'], {
    message: 'Internal server error',
  }),
});

type FormId = z.infer<typeof $FormIdSchema>['formId'];

const formIdToServerActionMap: Record<
  FormId,
  (formState: TemplateFormState, formData: FormData) => TemplateFormState
> = {
  'create-sms-template-back': (formState, formData) =>
    zodValidationServerAction(formState, formData, $GoBackSchema),
  'create-sms-template': (formState, formData) =>
    zodValidationServerAction(formState, formData, $CreateSmsTemplateSchema),
};

const formIdToPageMap: Record<FormId, string> = {
  'create-sms-template-back': 'choose-a-template-type',
  'create-sms-template': 'preview-text-message-template',
};

export async function processFormActions(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const formId = formData.get('form-id');

  const { success, error, data } = $FormIdSchema.safeParse({ formId });

  if (!success) {
    return {
      ...formState,
      validationError: error.flatten(),
    };
  }

  const { validationError, ...fields } = formIdToServerActionMap[data.formId](
    formState,
    formData
  );

  if (validationError) {
    return {
      ...formState,
      validationError,
    };
  }

  const updatedSession = await saveSession(fields);

  return redirect(
    `/${formIdToPageMap[data.formId]}/${updatedSession.id}`,
    RedirectType.push
  );
}
