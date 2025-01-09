import { redirect, RedirectType } from 'next/navigation';
import {
  FormState,
  TemplateType,
  templateTypeToUrlTextMappings,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

const $ChooseTemplate = z.object({
  templateType: z.nativeEnum(TemplateType, {
    message: 'Select a template type',
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
    `/create-${templateTypeToUrlTextMappings(parsedForm.data.templateType)}-template`,
    RedirectType.push
  );
}
