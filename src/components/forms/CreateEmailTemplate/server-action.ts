import { TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';

const schema = z.object({
  formId: z.enum(['create-email-template-back', 'create-email-template'], {
    message: 'Internal server error',
  }),
});

const formIdToServerActionMap: Record<
  'create-email-template-back' | 'create-email-template',
  (formState: TemplateFormState, formData: FormData) => TemplateFormState
> = {
  'create-email-template-back': (formState, formData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        emailTemplateName: z.string({ message: 'Internal server error' }),
        emailTemplateSubjectLine: z.string({
          message: 'Internal server error',
        }),
        emailTemplateMessage: z.string({ message: 'Internal server error' }),
      })
    ),
  'create-email-template': (formState: TemplateFormState, formData: FormData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        emailTemplateName: z
          .string()
          .min(1, { message: 'Enter a template name' }),
        emailTemplateSubjectLine: z
          .string()
          .min(1, { message: 'Enter a template subject line' }),
        emailTemplateMessage: z
          .string()
          .min(1, { message: 'Enter a template message' }),
      })
    ),
};

const formIdToPageMap: Record<
  'create-email-template-back' | 'create-email-template',
  string
> = {
  'create-email-template-back': 'choose-a-template-type',
  'create-email-template': 'preview-email-template',
};

export async function createEmailTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const formId = formData.get('form-id');
  const parsedFormId = schema.safeParse({ formId });

  if (!parsedFormId.success) {
    return {
      ...formState,
      validationError: parsedFormId.error.flatten(),
    };
  }

  const response = formIdToServerActionMap[parsedFormId.data.formId](
    formState,
    formData
  );

  if (!response.validationError) {
    await saveSession(response);

    const page = formIdToPageMap[parsedFormId.data.formId];
    return {
      ...response,
      redirect: `/${page}/${formState.id}`,
    };
  }

  return response;
}
