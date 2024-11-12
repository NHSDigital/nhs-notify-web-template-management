import { TemplateFormState, SMSTemplate, Draft } from '@utils/types';
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

const $GoBackSchema = z.object({
  smsTemplateName: z.string({ message: 'Internal server error' }),
  smsTemplateMessage: z.string({ message: 'Internal server error' }),
});

const formIdMap = {
  'create-sms-template-back': {
    schema: $GoBackSchema,
    redirectPath: 'choose-a-template-type',
  },
  'create-sms-template': {
    schema: $CreateSmsTemplateSchema,
    redirectPath: 'preview-text-message-template',
  },
};

export async function processFormActions(
  formState: TemplateFormState<SMSTemplate | Draft<SMSTemplate>>,
  formData: FormData
): Promise<TemplateFormState<SMSTemplate | Draft<SMSTemplate>>> {
  const formId = formData.get('form-id');

  if (
    formId !== 'create-sms-template-back' &&
    formId !== 'create-sms-template'
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

  const { smsTemplateName, smsTemplateMessage } = parsedForm.data;

  const updatedTemplate = {
    ...formState,
    name: smsTemplateName,
    message: smsTemplateMessage,
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(`/${redirectPath}/${savedTemplate.id}`, RedirectType.push);
}
