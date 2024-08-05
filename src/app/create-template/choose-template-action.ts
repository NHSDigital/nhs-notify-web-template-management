import { Page, TemplateFormState, TemplateType } from '@/src/utils/types';
import { zodValidationServerAction } from '@/src/utils/zod-validation-server-action';
import { z } from 'zod';

const templateTypeToPageMap: Record<TemplateType, Page> = {
  SMS: 'create-sms-template',
  EMAIL: 'create-email-template',
  LETTER: 'create-letter-template',
  NHS_APP: 'create-nhs-app-template',
};

export function chooseTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): TemplateFormState {
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
    }),
    'choose-template'
  );

  if (!response.validationError) {
    response.page = templateTypeToPageMap[response.templateType];
  }
  return response;
}
