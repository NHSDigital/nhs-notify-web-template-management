import { TemplateFormState } from '@utils/types';
import { z } from 'zod';
import { saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_EMAIL_CHARACTER_LENGTH } from '@utils/constants';

const $CreateEmailTemplateSchema = z.object({
  emailTemplateName: z
    .string({ message: 'Enter a template name' })
    .min(1, { message: 'Enter a template name' }),
  emailTemplateSubjectLine: z
    .string({ message: 'Enter a template subject line' })
    .min(1, { message: 'Enter a template subject line' }),
  emailTemplateMessage: z
    .string({ message: 'Enter a template message' })
    .min(1, { message: 'Enter a template message' })
    .max(MAX_EMAIL_CHARACTER_LENGTH, {
      message: 'Template message too long',
    }),
});

const $GoBackSchema = z.object({
  emailTemplateName: z.string({ message: 'Internal server error' }),
  emailTemplateSubjectLine: z.string({ message: 'Internal server error' }),
  emailTemplateMessage: z.string({ message: 'Internal server error' }),
});

const formIdMap = {
  'create-email-template-back': {
    schema: $GoBackSchema,
    redirectPath: 'choose-a-template-type',
  },
  'create-email-template': {
    schema: $CreateEmailTemplateSchema,
    redirectPath: 'preview-email-template',
  },
};

export async function processFormActions(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const formId = formData.get('form-id');

  if (
    formId !== 'create-email-template-back' &&
    formId !== 'create-email-template'
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

  const { emailTemplateName, emailTemplateSubjectLine, emailTemplateMessage } =
    parsedForm.data;

  const updatedTemplate = {
    ...formState,
    EMAIL: {
      name: emailTemplateName,
      subject: emailTemplateSubjectLine,
      message: emailTemplateMessage,
    },
  };

  const savedTemplate = await saveTemplate(updatedTemplate);

  return redirect(`/${redirectPath}/${savedTemplate.id}`, RedirectType.push);
}
