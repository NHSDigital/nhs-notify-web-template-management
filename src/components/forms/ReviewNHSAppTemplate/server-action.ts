import { z } from 'zod';
import { MarkdownItWrapper } from '@utils/markdownit';
import { TemplateFormState } from '@utils/types';
import { SendEmail } from '@utils/form-actions';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}

const radioSelectionToPageMap: Record<'nhsapp-edit' | 'nhsapp-submit', string> =
  {
    'nhsapp-edit': 'create-nhs-app-template',
    'nhsapp-submit': 'submit-template',
  };

const schema = z.object({
  reviewNHSAppTemplateAction: z.enum(['nhsapp-edit', 'nhsapp-submit'], {
    message: 'Select an option',
  }),
});

export async function reviewNhsAppTemplateAction(
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const form = Object.fromEntries(formData.entries());
  const validationResponse = schema.safeParse(form);

  if (!validationResponse.success) {
    return {
      ...formState,
      validationError: validationResponse.error.flatten(),
    };
  }

  await SendEmail();

  const page =
    radioSelectionToPageMap[validationResponse.data.reviewNHSAppTemplateAction];

  return {
    ...formState,
    redirect: `/${page}/${formState.id}`,
  };
}
