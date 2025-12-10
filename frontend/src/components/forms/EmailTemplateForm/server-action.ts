import {
  CreateUpdateEmailTemplate,
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { createTemplate, saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import {
  MAX_EMAIL_CHARACTER_LENGTH,
  INVALID_PERSONALISATION_FIELDS,
} from '@utils/constants';
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
    })
    .refine(
      (templateMessage) =>
        !INVALID_PERSONALISATION_FIELDS.some((personalisationFieldName) =>
          templateMessage.includes(`((${personalisationFieldName}))`)
        ),
      {
        message: `${form.emailTemplateMessage.error.invalidPersonalisation} ${INVALID_PERSONALISATION_FIELDS.join(', ')}`,
      }
    ),
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

  const template = {
    ...formState,
    name: emailTemplateName,
    subject: emailTemplateSubjectLine,
    message: emailTemplateMessage,
  };

  let savedId: string;

  if ('id' in template) {
    const { success, data: templateId } = z.uuidv4().safeParse(template.id);

    if (!success) {
      return redirect('/invalid-template', RedirectType.replace);
    }

    const saved = await saveTemplate(templateId, template);
    savedId = saved.id;
  } else {
    const saved = await createTemplate(template);
    savedId = saved.id;
  }

  return redirect(
    `/preview-email-template/${savedId}?from=edit`,
    RedirectType.push
  );
}
