import {
  CreateUpdateEmailTemplate,
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { createTemplate, saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_EMAIL_CHARACTER_LENGTH } from '@utils/constants';

const $EmailTemplateFormSchema = z.object({
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

export async function processFormActions(
  formState: TemplateFormState<CreateUpdateEmailTemplate | EmailTemplate>,
  formData: FormData
): Promise<TemplateFormState<CreateUpdateEmailTemplate | EmailTemplate>> {
  const parsedForm = $EmailTemplateFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  delete formState.validationError;

  const { emailTemplateName, emailTemplateSubjectLine, emailTemplateMessage } =
    parsedForm.data;

  const updatedTemplate = {
    ...formState,
    name: emailTemplateName,
    subject: emailTemplateSubjectLine,
    message: emailTemplateMessage,
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(
    `/preview-email-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
