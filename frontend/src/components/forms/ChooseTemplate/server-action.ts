import { redirect, RedirectType } from 'next/navigation';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import {
  FormState,
  templateCreationPages,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import content from '@content/content';

export const $ChooseTemplate = z.object({
  templateType: z.enum(TEMPLATE_TYPE_LIST, {
    message: content.components.chooseTemplate.form.templateType.error,
  }),
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
    templateCreationPages(parsedForm.data.templateType),
    RedirectType.push
  );
}
