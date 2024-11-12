import { TemplateFormState, NHSAppTemplate, Draft } from '@utils/types';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const $CreateNhsAppTemplateSchema = z.object({
  nhsAppTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  nhsAppTemplateMessage: z
    .string({ message: 'Enter a template message' })
    .min(1, { message: 'Enter a template message' })
    .max(5000, { message: 'Template message too long' }),
});

const $GoBackSchema = z.object({
  nhsAppTemplateName: z.string({ message: 'Internal server error' }),
  nhsAppTemplateMessage: z.string({ message: 'Internal server error' }),
});

const formIdMap = {
  'create-nhs-app-template-back': {
    schema: $GoBackSchema,
    redirectPath: 'choose-a-template-type',
  },
  'create-nhs-app-template': {
    schema: $CreateNhsAppTemplateSchema,
    redirectPath: 'preview-nhs-app-template',
  },
};

export async function processFormActions(
  formState: TemplateFormState<NHSAppTemplate | Draft<NHSAppTemplate>>,
  formData: FormData
): Promise<TemplateFormState<NHSAppTemplate | Draft<NHSAppTemplate>>> {
  const formId = formData.get('form-id');

  if (
    formId !== 'create-nhs-app-template-back' &&
    formId !== 'create-nhs-app-template'
  ) {
    return {
      ...formState,
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
    };
  }

  const { schema, redirectPath } = formIdMap[formId];

  const parsedForm = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  const { nhsAppTemplateName, nhsAppTemplateMessage } = parsedForm.data;

  const updatedTemplate = {
    ...formState,
    name: nhsAppTemplateName,
    message: nhsAppTemplateMessage,
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(`/${redirectPath}/${savedTemplate.id}`, RedirectType.push);
}
