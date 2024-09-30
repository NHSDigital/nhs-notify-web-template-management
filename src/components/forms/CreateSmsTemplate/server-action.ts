import { TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { z } from 'zod';
import { saveSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';

export async function createSmsTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const { validationError, ...fields } = zodValidationServerAction(
    formState,
    formData,
    z.object({
      smsTemplateName: z
        .string({ message: 'Enter a template name' })
        .min(1, { message: 'Enter a template name' }),
      smsTemplateMessage: z
        .string({ message: 'Enter a template message' })
        .min(1, { message: 'Enter a template message' })
        .max(MAX_SMS_CHARACTER_LENGTH, {
          message: 'Template message too long',
        }),
    })
  );

  if (validationError) {
    return {
      ...formState,
      validationError,
    };
  }

  const updatedSession = await saveSession({
    id: formState.id,
    templateType: formState.templateType,
    smsTemplateName: fields.smsTemplateName,
    smsTemplateMessage: fields.smsTemplateMessage,
    nhsAppTemplateMessage: ' ',
    nhsAppTemplateName: ' ',
  });

  return redirect(
    `/preview-text-message-template/${updatedSession.id}`,
    RedirectType.push
  );
}
