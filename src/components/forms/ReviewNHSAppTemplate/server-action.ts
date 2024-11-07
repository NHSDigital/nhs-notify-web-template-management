import { z } from 'zod';
import { MarkdownItWrapper } from '@utils/markdownit';
import { NHSAppTemplate, TemplateFormState } from '@utils/types';

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

  return {
    ...formState,
    redirect: `/${page}/${formState.id}`,
  };
}
