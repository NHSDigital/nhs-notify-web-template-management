import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const {
  components: {
    previewNHSAppTemplate: { form },
  },
} = content;

const radioSelectionToPageMap: Record<'nhsapp-edit' | 'nhsapp-submit', string> =
  {
    'nhsapp-edit': 'edit-nhs-app-template',
    'nhsapp-submit': 'submit-nhs-app-template',
  };

export const schema = z.object({
  previewNHSAppTemplateAction: z.enum(['nhsapp-edit', 'nhsapp-submit'], {
    message: form.previewNHSAppTemplateAction.error.empty,
  }),
});

export function previewNhsAppTemplateAction(
  formState: TemplateFormState<NHSAppTemplate>,
  formData: FormData
): TemplateFormState<NHSAppTemplate> {
  const formFields = Object.fromEntries(formData.entries());
  const validationResponse = schema.safeParse(formFields);

  if (!validationResponse.success) {
    return {
      ...formState,
      validationError: validationResponse.error.flatten(),
    };
  }

  const page =
    radioSelectionToPageMap[
      validationResponse.data.previewNHSAppTemplateAction
    ];

  return redirect(`/${page}/${formState.id}`, RedirectType.push);
}
