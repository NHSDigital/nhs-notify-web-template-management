import {
  CreateUpdateEmailTemplate,
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { createTemplate, saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_EMAIL_CHARACTER_LENGTH } from '@utils/constants';
import content from '@content/content';

const {
  components: {
    templateFormEmail: { form },
  },
} = content;

export const $EmailTemplateFormSchema = z.object({
  emailTemplateName: z
    .string({ message: form.emailTemplateName.error.empty })
    .min(1, { message: form.emailTemplateName.error.empty }),
  emailTemplateSubjectLine: z
    .string({ message: form.emailTemplateSubjectLine.error.empty })
    .min(1, { message: form.emailTemplateSubjectLine.error.empty }),
  emailTemplateMessage: z
    .string({ message: form.emailTemplateMessage.error.empty })
    .min(1, { message: form.emailTemplateMessage.error.empty })
    .max(MAX_EMAIL_CHARACTER_LENGTH, {
      message: form.emailTemplateMessage.error.max,
    })
    .refine((templateMessage) => !templateMessage.includes('http://'), {
      message: form.emailTemplateMessage.error.insecureLink,
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
      errorState: z.flattenError(parsedForm.error),
    };
  }

  delete formState.errorState;

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
