import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { TemplateFormState, TemplateType } from '@utils/types';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';

const templateTypeToPageMap: Record<TemplateType, string> = {
  SMS: 'create-sms-template',
  EMAIL: 'create-email-template',
  LETTER: 'create-letter-template',
  NHS_APP: 'create-nhs-app-template',
};

export async function chooseTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const response = zodValidationServerAction(
    formState,
    formData,
    z.object({
      templateType: z.enum(
        [
          TemplateType.SMS,
          TemplateType.EMAIL,
          TemplateType.NHS_APP,
          TemplateType.LETTER,
        ],
        { message: 'Select a template type' }
      ),
    })
  );

  if (!response.validationError) {
    await saveSession(response);

    const page = templateTypeToPageMap[response.templateType];
    return {
      ...response,
      redirect: `/${page}/${formState.id}`,
    };
  }

  return response;
}
