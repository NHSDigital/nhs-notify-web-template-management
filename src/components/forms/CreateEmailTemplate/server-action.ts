import { TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const $CreateEmailTemplateSchema = z.object({
  emailTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  emailTemplateSubjectLine: z
    .string({ message: 'Enter a template subject line' })
    .min(1, { message: 'Enter a template subject line' }),
  emailTemplateMessage: z
    .string({ message: 'Enter a template message' })
    .min(1, { message: 'Enter a template message' }),
});

const $GoBackSchema = z.object({
  emailTemplateName: z.string({ message: 'Internal server error' }),
  emailTemplateSubjectLine: z.string({ message: 'Internal server error' }),
  emailTemplateMessage: z.string({ message: 'Internal server error' }),
});

const $FormIdSchema = z.object({
  formId: z.enum(['create-email-template-back', 'create-email-template'], {
    message: 'Internal server error',
  }),
});

type FormId = z.infer<typeof $FormIdSchema>['formId'];

const formIdToServerActionMap: Record<
  FormId,
  (formState: TemplateFormState, formData: FormData) => TemplateFormState
> = {
  'create-email-template-back': (formState, formData) =>
    zodValidationServerAction(formState, formData, $GoBackSchema),
  'create-email-template': (formState, formData) =>
    zodValidationServerAction(formState, formData, $CreateEmailTemplateSchema),
};

const formIdToPageMap: Record<FormId, string> = {
  'create-email-template-back': 'choose-a-template-type',
  'create-email-template': 'preview-email-template',
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
