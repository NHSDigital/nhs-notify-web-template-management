import {
  TemplateFormState,
  NHSAppTemplate,
  CreateUpdateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';

const {
  components: {
    templateFormNhsApp: { form },
  },
} = content;

export const $CreateNhsAppTemplateSchema = z.object({
  nhsAppTemplateName: z
    .string({ message: form.nhsAppTemplateName.error.empty })
    .min(1, { message: form.nhsAppTemplateName.error.empty }),
  nhsAppTemplateMessage: z
    .string({ message: form.nhsAppTemplateMessage.error.empty })
    .min(1, { message: form.nhsAppTemplateMessage.error.empty })
    .max(5000, { message: form.nhsAppTemplateMessage.error.max }),
});

export async function processFormActions(
  formState: TemplateFormState<NHSAppTemplate | CreateUpdateNHSAppTemplate>,
  formData: FormData
): Promise<TemplateFormState<NHSAppTemplate | CreateUpdateNHSAppTemplate>> {
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
