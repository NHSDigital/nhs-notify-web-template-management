import { redirect, RedirectType } from 'next/navigation';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import {
  FormState,
  templateCreationPages,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import content from '@content/content';

export const $ChooseTemplateType = z.object({
  templateType: z.enum(TEMPLATE_TYPE_LIST, {
    message: content.components.chooseTemplateType.form.templateType.error,
  }),
});

export async function chooseTemplateTypeAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsedForm = $ChooseTemplateType.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      errorState: z.flattenError(parsedForm.error),
    };
  }

  redirect(
    templateCreationPages(parsedForm.data.templateType),
    RedirectType.push
  );
}
