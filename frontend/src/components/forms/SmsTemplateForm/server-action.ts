import {
  TemplateFormState,
  SMSTemplate,
  Draft,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';

const $CreateSmsTemplateSchema = z.object({
  smsTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  smsTemplateMessage: z
    .string({ message: 'Enter a template message' })
    .min(1, { message: 'Enter a template message' })
    .max(MAX_SMS_CHARACTER_LENGTH, { message: 'Template message too long' }),
});

export async function processFormActions(
  formState: TemplateFormState<SMSTemplate | Draft<SMSTemplate>>,
  formData: FormData
): Promise<TemplateFormState<SMSTemplate | Draft<SMSTemplate>>> {
  const parsedForm = $CreateSmsTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  delete formState.validationError;

  const { smsTemplateName, smsTemplateMessage } = parsedForm.data;

  const updatedTemplate = {
    ...formState,
    name: smsTemplateName,
    message: smsTemplateMessage,
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(
    `/preview-text-message-template/${savedTemplate.id}`,
    RedirectType.push
  );
}
