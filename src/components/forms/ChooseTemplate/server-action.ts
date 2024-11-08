import { TemplateFormState } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { z } from 'zod';
import { saveTemplate } from '@utils/form-actions';

const templateTypeToPageMap: Record<TemplateType, string> = {
  SMS: 'create-text-message-template',
  EMAIL: 'create-email-template',
  LETTER: 'create-letter-template',
  NHS_APP: 'create-nhs-app-template',
};

const $ChooseTemplate = z.object({
  templateType: z.enum(
    [
      TemplateType.SMS,
      TemplateType.EMAIL,
      TemplateType.NHS_APP,
      TemplateType.LETTER,
    ],
    { message: 'Select a template type' }
  ),
});

export async function chooseTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const parsedForm = $ChooseTemplate.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  const template = {
    ...formState,
    ...parsedForm.data,
  };

  await saveTemplate(template, true);

  return {
    ...template,
    redirect: `/${templateTypeToPageMap[parsedForm.data.templateType]}/${formState.id}`,
  };
}
