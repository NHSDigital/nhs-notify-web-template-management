import {
  TemplateFormState,
  SMSTemplate,
  CreateUpdateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import content from '@content/content';

const {
  components: {
    templateFormSms: { form },
  },
} = content;

export const $CreateSmsTemplateSchema = z.object({
  smsTemplateName: z
    .string({ message: form.smsTemplateName.error.empty })
    .min(1, { message: form.smsTemplateName.error.empty }),
  smsTemplateMessage: z
    .string({ message: form.smsTemplateMessage.error.empty })
    .min(1, { message: form.smsTemplateMessage.error.empty })
    .max(MAX_SMS_CHARACTER_LENGTH, {
      message: form.smsTemplateMessage.error.max,
    })
    .refine((templateMessage) => !templateMessage.includes('http://'), {
      message: form.smsTemplateMessage.error.insecureLink,
    }),
});

export async function processFormActions(
  formState: TemplateFormState<SMSTemplate | CreateUpdateSMSTemplate>,
  formData: FormData
): Promise<TemplateFormState<SMSTemplate | CreateUpdateSMSTemplate>> {
  const parsedForm = $CreateSmsTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsedForm.error),
    };
  }

  delete formState.errorState;

  const { smsTemplateName, smsTemplateMessage } = parsedForm.data;

  const template = {
    ...formState,
    name: smsTemplateName,
    message: smsTemplateMessage,
  };

  let savedId: string;

  if ('id' in template) {
    const { success, data: templateId } = z.uuid().safeParse(template.id);

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
    `/preview-text-message-template/${savedId}?from=edit`,
    RedirectType.push
  );
}
