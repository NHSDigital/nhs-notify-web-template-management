import { redirect, RedirectType } from 'next/navigation';
import { FormState } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { z } from 'zod';

const templateTypeToPageMap: Record<TemplateType, string> = {
  SMS: '/create-text-message-template',
  EMAIL: '/create-email-template',
  LETTER: '/create-letter-template',
  NHS_APP: '/create-nhs-app-template',
};

const $ChooseTemplate = z.object({
  templateType: z.enum(
    [
      TemplateType.SMS,
      TemplateType.EMAIL,
      TemplateType.NHS_APP,
      TemplateType.LETTER,
    ],
    { message: 'Select a template type' }
  ),
});

export async function chooseTemplateAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsedForm = $ChooseTemplate.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      validationError: parsedForm.error.flatten(),
    };
  }

  redirect(
    templateTypeToPageMap[parsedForm.data.templateType],
    RedirectType.push
  );
}
