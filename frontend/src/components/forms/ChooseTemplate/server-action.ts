import { redirect, RedirectType } from 'next/navigation';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import {
  FormState,
  templateTypeToUrlTextMappings,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

const [firstTemplateType, ...remainingTemplateTypes] = TEMPLATE_TYPE_LIST;

const $ChooseTemplate = z.object({
  templateType: z.enum([firstTemplateType, ...remainingTemplateTypes], {
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
