import { redirect } from 'next/navigation';
import { TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';

const schema = z.object({
  formId: z.enum(['create-nhs-app-template-back', 'create-nhs-app-template'], {
    message: 'Internal server error',
  }),
});

const formIdToServerActionMap: Record<
  'create-nhs-app-template-back' | 'create-nhs-app-template',
  (formState: TemplateFormState, formData: FormData) => TemplateFormState
> = {
  'create-nhs-app-template-back': (formState, formData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        nhsAppTemplateName: z.string({ message: 'Internal server error' }),
        nhsAppTemplateMessage: z.string({ message: 'Internal server error' }),
      })
    ),
  'create-nhs-app-template': (
    formState: TemplateFormState,
    formData: FormData
  ) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        nhsAppTemplateName: z
          .string()
          .min(1, { message: 'Enter a template name' }),
        nhsAppTemplateMessage: z
          .string()
          .min(1, { message: 'Enter a template message' })
          .max(5000, { message: 'Template message too long' }),
      })
    ),
};

const formIdToPageMap: Record<
  'create-nhs-app-template-back' | 'create-nhs-app-template',
  string
> = {
  'create-nhs-app-template-back': 'choose-a-template-type',
  'create-nhs-app-template': 'preview-nhs-app-template',
};

export async function createNhsAppTemplateAction(
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
    redirect(`/${page}/${formState.id}`);
  }

  return response;
}
