import {
  TemplateFormState,
  NHSAppTemplate,
  CreateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
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
  formState: TemplateFormState<NHSAppTemplate | CreateNHSAppTemplate>,
  formData: FormData
): Promise<TemplateFormState<NHSAppTemplate | CreateNHSAppTemplate>> {
  const parsedForm = $CreateNhsAppTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  delete formState.validationError;

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
    `/preview-nhs-app-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
