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

  const updatedTemplate = {
    ...formState,
    name: smsTemplateName,
    message: smsTemplateMessage,
  };

  const savedTemplate = await ('id' in updatedTemplate
    ? saveTemplate(updatedTemplate)
    : createTemplate(updatedTemplate));

  return redirect(
    `/preview-text-message-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
