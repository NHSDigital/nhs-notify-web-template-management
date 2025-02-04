import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';

const radioSelectionToPageMap: Record<'nhsapp-edit' | 'nhsapp-submit', string> =
  {
    'nhsapp-edit': 'edit-nhs-app-template',
    'nhsapp-submit': 'submit-nhs-app-template',
  };

const schema = z.object({
  reviewNHSAppTemplateAction: z.enum(['nhsapp-edit', 'nhsapp-submit'], {
    message: 'Select an option',
  }),
});

export function reviewNhsAppTemplateAction(
  formState: TemplateFormState<NHSAppTemplate>,
  formData: FormData
): TemplateFormState<NHSAppTemplate> {
  const form = Object.fromEntries(formData.entries());
  const validationResponse = schema.safeParse(form);

  if (!validationResponse.success) {
    return {
      ...formState,
      validationError: validationResponse.error.flatten(),
    };
  }

  const page =
    radioSelectionToPageMap[validationResponse.data.reviewNHSAppTemplateAction];

  return redirect(`/${page}/${formState.id}`, RedirectType.push);
}
