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

function radioSelectionToRedirectUrl(
  selection: 'nhsapp-edit' | 'nhsapp-submit',
  id: string,
  lockNumber: number
) {
  if (selection === 'nhsapp-edit') {
    return `/edit-nhs-app-template/${id}`;
  }

  return `/submit-nhs-app-template/${id}?lockNumber=${lockNumber}`;
}

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
      errorState: z.flattenError(validationResponse.error),
    };
  }

  return redirect(
    radioSelectionToRedirectUrl(
      validationResponse.data.previewNHSAppTemplateAction,
      formState.id,
      formState.lockNumber
    ),
    RedirectType.push
  );
}
