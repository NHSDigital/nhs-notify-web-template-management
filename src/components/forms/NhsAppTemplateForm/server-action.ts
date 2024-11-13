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

export async function processFormActions(
  formState: TemplateFormState<NHSAppTemplate | Draft<NHSAppTemplate>>,
  formData: FormData
): Promise<TemplateFormState<NHSAppTemplate | Draft<NHSAppTemplate>>> {
  const parsedForm = $CreateNhsAppTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

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

  return redirect(
    `/preview-nhs-app-template/${savedTemplate.id}`,
    RedirectType.push
  );
}
